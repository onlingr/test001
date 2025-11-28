from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

# --- 資料庫設定 (請將 root:password 修改為您的帳號密碼) ---
DATABASE_URL = "mysql+pymysql://root:520999@localhost/tasty_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SQLAlchemy Models (資料表對應) ---
class DBMenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(Text)
    price = Column(Integer)
    category = Column(String(50))
    image_url = Column(Text) # Base64 might be long
    is_available = Column(Boolean, default=True)

class DBOrder(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100))
    customer_phone = Column(String(50))
    customer_note = Column(Text, nullable=True)
    total_amount = Column(Integer)
    status = Column(String(50), default="待處理")
    created_at = Column(DateTime, default=datetime.now)
    items = relationship("DBOrderItem", back_populates="order")

class DBOrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_name = Column(String(255))
    price = Column(Integer)
    quantity = Column(Integer)
    order = relationship("DBOrder", back_populates="items")

class DBSetting(Base):
    __tablename__ = "settings"
    setting_key = Column(String(50), primary_key=True)
    setting_value = Column(Text)

Base.metadata.create_all(bind=engine)

# --- Pydantic Models (API 請求/回應格式) ---
class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: int
    category: str
    imageUrl: str
    isAvailable: bool

class MenuItemResponse(MenuItemCreate):
    id: int # Python DB ID is int, Frontend expects string (will convert)
    class Config:
        orm_mode = True

class OrderItemSchema(BaseModel):
    name: str
    price: int
    quantity: number

class OrderCreate(BaseModel):
    items: List[OrderItemSchema]
    totalAmount: int
    customerName: str
    customerPhone: str
    customerNote: str

class StoreSettings(BaseModel):
    name: str
    isOpen: bool

# --- FastAPI App ---
app = FastAPI()

# 設定 CORS 允許前端連線
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 生產環境請改為前端網址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

# 1. Menu
@app.get("/api/menu")
def get_menu(db: Session = Depends(get_db)):
    items = db.query(DBMenuItem).all()
    # Convert keys to match frontend expectation (imageUrl -> image_url mapping handled by loop or manual)
    return [{"id": str(i.id), "name": i.name, "description": i.description, "price": i.price, "category": i.category, "imageUrl": i.image_url, "isAvailable": i.is_available} for i in items]

@app.post("/api/menu")
def add_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    db_item = DBMenuItem(name=item.name, description=item.description, price=item.price, category=item.category, image_url=item.imageUrl, is_available=item.isAvailable)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"status": "ok"}

@app.put("/api/menu/{item_id}")
def update_menu_item(item_id: int, item: MenuItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(DBMenuItem).filter(DBMenuItem.id == item_id).first()
    if not db_item: raise HTTPException(status_code=404, detail="Item not found")
    db_item.name = item.name
    db_item.description = item.description
    db_item.price = item.price
    db_item.category = item.category
    db_item.image_url = item.imageUrl
    db_item.is_available = item.isAvailable
    db.commit()
    return {"status": "updated"}

@app.delete("/api/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    db.query(DBMenuItem).filter(DBMenuItem.id == item_id).delete()
    db.commit()
    return {"status": "deleted"}

@app.put("/api/menu/{item_id}/toggle")
def toggle_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(DBMenuItem).filter(DBMenuItem.id == item_id).first()
    if item:
        item.is_available = not item.is_available
        db.commit()
    return {"status": "toggled"}

# 2. Orders
@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(DBOrder).order_by(DBOrder.created_at.desc()).all()
    result = []
    for o in orders:
        items = [{"name": i.menu_item_name, "price": i.price, "quantity": i.quantity, "id": str(i.id), "description": "", "category": "", "imageUrl": "", "isAvailable": True} for i in o.items] # Construct dummy MenuItem structure for CartItem compatibility
        result.append({
            "id": str(o.id),
            "customerName": o.customer_name,
            "customerPhone": o.customer_phone,
            "customerNote": o.customer_note,
            "totalAmount": o.total_amount,
            "status": o.status,
            "timestamp": int(o.created_at.timestamp() * 1000),
            "items": items
        })
    return result

@app.post("/api/orders")
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = DBOrder(
        customer_name=order.customerName,
        customer_phone=order.customerPhone,
        customer_note=order.customerNote,
        total_amount=order.totalAmount,
        status="待處理"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in order.items:
        db_item = DBOrderItem(order_id=db_order.id, menu_item_name=item.name, price=item.price, quantity=item.quantity)
        db.add(db_item)
    
    db.commit()
    return {"status": "created"}

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, status_data: dict, db: Session = Depends(get_db)):
    order = db.query(DBOrder).filter(DBOrder.id == order_id).first()
    if order:
        order.status = status_data['status']
        db.commit()
    return {"status": "updated"}

# 3. Settings
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(DBSetting).filter(DBSetting.setting_key == "store_config").first()
    if setting:
        return json.loads(setting.setting_value)
    return {"name": "滋味點餐", "isOpen": True}

@app.put("/api/settings")
def update_settings(settings: StoreSettings, db: Session = Depends(get_db)):
    setting = db.query(DBSetting).filter(DBSetting.setting_key == "store_config").first()
    val = json.dumps(settings.dict())
    if setting:
        setting.setting_value = val
    else:
        db.add(DBSetting(setting_key="store_config", setting_value=val))
    db.commit()
    return {"status": "updated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

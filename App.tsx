
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, ChefHat, LayoutDashboard, UtensilsCrossed, X, Star, ArrowLeft, CheckCircle, User, Phone, ShoppingBag, Filter, ArrowUpDown, ChevronDown, Clock, MapPin, Store, Settings, Save, Upload, Image, Search, Bell, Pencil, Lock, LogOut, ServerCrash, RefreshCw } from 'lucide-react';
import { MenuItem, Category, CartItem, Order, OrderStatus, ViewMode, StoreSettings } from './types';
import { api } from './services/api';

// --- Components ---

// 0. Connection Error Screen
const ConnectionErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ServerCrash className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-3">無法連接到後端伺服器</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">
        前端網頁無法與後端取得聯繫。這通常代表伺服器未啟動。請嘗試以下步驟：
      </p>
      
      <div className="bg-gray-50 rounded-xl p-4 text-left mb-8 space-y-3 border border-gray-200">
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <p className="text-sm text-gray-700">確認已安裝 Python 與套件<br/><code className="text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-600">pip install fastapi uvicorn sqlalchemy pymysql</code></p>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <p className="text-sm text-gray-700">確認 MariaDB 資料庫已建立並執行 SQL</p>
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">3</div>
          <p className="text-sm text-gray-700">確認後端伺服器正在執行<br/><code className="text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-600">python main.py</code></p>
        </div>
      </div>

      <button 
        onClick={onRetry}
        className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" /> 重試連線
      </button>
    </div>
  </div>
);

// 0. Admin Login Modal
const AdminLoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-bounce-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">管理員登入</h3>
          <p className="text-gray-500 text-sm mb-6">請輸入管理密碼以進入後台</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-center font-bold text-lg tracking-widest outline-none transition-all focus:ring-2 focus:ring-brand-500 ${error ? 'border-red-500 bg-red-50 text-red-600 placeholder-red-300' : 'border-gray-200 bg-gray-50 focus:bg-white text-gray-900'}`}
                placeholder="••••"
                maxLength={4}
              />
              {error && (
                <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">密碼錯誤，請重試 (預設: 1234)</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 active:scale-95 transition-all"
            >
              確認登入
            </button>
          </form>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// 1. Navigation Bar
const Navbar: React.FC<{
  mode: ViewMode;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
  cartCount: number;
  openCart: () => void;
  storeName: string;
}> = ({ mode, onSwitchToAdmin, onLogout, cartCount, openCart, storeName }) => (
  <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center cursor-pointer active:scale-95 transition-transform" onClick={mode === 'ADMIN' ? onLogout : undefined}>
          <div className="bg-brand-500 p-2 rounded-lg mr-2 shadow-lg shadow-brand-500/30">
            <UtensilsCrossed className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">{storeName}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {mode === 'CUSTOMER' ? (
            <button 
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors hover:bg-gray-50 rounded-full active:bg-gray-100"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold leading-none text-white transform bg-brand-600 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <span className="text-xs font-bold px-3 py-1 bg-gray-900 text-white rounded-full flex items-center gap-1">
              <User className="w-3 h-3" /> 管理員
            </span>
          )}
          
          <button
            onClick={mode === 'CUSTOMER' ? onSwitchToAdmin : onLogout}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'CUSTOMER' 
                ? 'text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50' 
                : 'text-red-500 border border-red-100 bg-red-50 hover:bg-red-100'
            }`}
          >
            {mode === 'CUSTOMER' ? (
              '切換後台'
            ) : (
              <>
                <LogOut className="w-3 h-3" /> 登出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// 2. Customer Menu View
const CustomerMenu: React.FC<{
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
  isShopOpen: boolean;
  storeName: string;
}> = ({ menu, addToCart, isShopOpen, storeName }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) || 
                          item.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 pt-4 md:pt-8">
      
      {/* Store Status Banner */}
      <div className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">歡迎光臨，{storeName}</h1>
          <p className="text-gray-500 text-sm">現點現做，極致美味，讓每一口都成為享受。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${
            isShopOpen 
              ? 'bg-green-50 text-green-700 border-green-100' 
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isShopOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-bold text-sm">{isShopOpen ? '營業中' : '休息中'}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow sm:text-sm shadow-sm"
          placeholder="搜尋想吃的餐點..."
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sticky Category Filter */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-md -mx-4 px-4 py-3 mb-6 shadow-sm border-b border-gray-200/50">
        <div className="flex overflow-x-auto gap-2 no-scrollbar items-center md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-bold transition-all flex-shrink-0 ${
              selectedCategory === 'ALL' 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            全部餐點
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-bold transition-all flex-shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredMenu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-50">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${!item.isAvailable ? 'grayscale' : ''}`}
                />
                {(!item.isAvailable || !isShopOpen) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white font-bold text-sm border border-white/50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                      {!isShopOpen ? '休息中' : '售完'}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-2 pb-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <span className="text-brand-600 font-bold text-lg">${item.price}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable || !isShopOpen}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    item.isAvailable && isShopOpen
                      ? 'bg-gray-900 text-white hover:bg-brand-600 shadow-lg shadow-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  {isShopOpen ? (item.isAvailable ? '加入購物車' : '暫時售完') : '非營業時間'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">找不到相關餐點</h3>
          <p className="text-gray-500">試試看搜尋其他關鍵字或切換分類</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="mt-6 px-6 py-2 bg-white border border-gray-200 text-brand-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            查看所有餐點
          </button>
        </div>
      )}
    </div>
  );
};

// 3. Cart Drawer
const CartDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  submitOrder: (customerName: string, customerPhone: string, customerNote: string) => void;
  total: number;
}> = ({ isOpen, onClose, cart, updateQuantity, submitOrder, total }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      submitOrder(name, phone, note);
      setName('');
      setPhone('');
      setNote('');
    }
  };

  const isFormValid = name.trim().length > 0 && phone.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-end md:items-stretch">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={`
        relative w-full bg-white shadow-2xl flex flex-col transition-transform duration-300
        md:w-[480px] md:h-full md:rounded-l-2xl
        h-[85vh] rounded-t-2xl animate-slide-up md:animate-slide-left
      `}>
        
        <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-brand-600" /> 
            購物車
            <span className="text-sm font-normal text-gray-500 ml-2">({cart.length} 樣餐點)</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="relative">
                <div className="w-28 h-28 bg-brand-50 rounded-full flex items-center justify-center mb-2 animate-pulse">
                  <ShoppingBag className="w-14 h-14 text-brand-300" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">您的購物車是空的</h3>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">
                  肚子餓了嗎？快去看看我們為您準備的美味餐點吧！
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-full max-w-[200px] py-3 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                前往點餐 <UtensilsCrossed className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-8 pb-8">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                        <span className="text-brand-600 font-bold text-sm">${item.price * item.quantity}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-1 py-0.5 shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, -1000)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-l-4 border-brand-500 pl-3">
                  <User className="w-5 h-5" /> 
                  訂購人資訊
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="請輸入您的姓名"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white transition-colors text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        電話 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="請輸入聯絡電話"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white transition-colors text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        備註 (選填)
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="例如：去冰、半糖、醬料分開..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white transition-colors h-20 resize-none text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-8 md:pb-5">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium">總金額</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">${total}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || !isFormValid}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              cart.length === 0 || !isFormValid
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30 active:scale-95'
            }`}
          >
            {cart.length === 0 ? '購物車是空的' : !isFormValid ? '請填寫必填資料' : (
              <>
                確認結帳 <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Admin Dashboard
const AdminDashboard: React.FC<{
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  menu: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onEditMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onToggleItemAvailability: (id: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  refreshData: () => void;
}> = ({ orders, updateOrderStatus, menu, onAddMenuItem, onEditMenuItem, onDeleteMenuItem, onToggleItemAvailability, settings, onUpdateSettings, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'MENU' | 'SETTINGS'>('ORDERS');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [sortOption, setSortOption] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW'>('NEWEST');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Menu Search & Filter State
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<Category | 'ALL'>('ALL');

  // Settings Form State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);

  // Sync temp settings when props change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // Item Form State (Add/Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: Category.MAIN,
    description: '',
    imageUrl: '', // default empty, wait for upload
    isAvailable: true
  });

  // Calculate Pending Orders
  const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setNewItem({
      name: '',
      price: 0,
      category: Category.MAIN,
      description: '',
      imageUrl: '',
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable
    });
    setIsModalOpen(true);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.price && newItem.description) {
      if (editingId) {
        // Edit Mode
        onEditMenuItem({
          ...newItem as MenuItem,
          id: editingId,
        });
      } else {
        // Add Mode
        onAddMenuItem({
          ...newItem as MenuItem,
          id: '', // Backend will assign ID
          imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/300`,
        });
      }
      setIsModalOpen(false);
      setNewItem({
        name: '',
        price: 0,
        category: Category.MAIN,
        description: '',
        imageUrl: '',
        isAvailable: true
      });
      setEditingId(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.COOKING: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and Sort Logic
  const processedOrders = orders
    .filter(order => filterStatus === 'ALL' ? true : order.status === filterStatus)
    .sort((a, b) => {
      switch (sortOption) {
        case 'NEWEST': return b.timestamp - a.timestamp;
        case 'OLDEST': return a.timestamp - b.timestamp;
        case 'AMOUNT_HIGH': return b.totalAmount - a.totalAmount;
        case 'AMOUNT_LOW': return a.totalAmount - b.totalAmount;
        default: return 0;
      }
    });

  // Admin Menu Filter Logic
  const filteredAdminMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(menuSearchQuery.toLowerCase());
    const matchesCategory = adminCategoryFilter === 'ALL' || item.category === adminCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Admin Tabs */}
      <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur -mx-4 px-4 py-2 mb-6 border-b border-gray-200/50">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('ORDERS'); refreshData(); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all relative ${
              activeTab === 'ORDERS' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> 訂單
            {pendingOrdersCount > 0 && (
              <span className="absolute top-2 right-2 md:top-auto md:right-auto md:ml-2 md:relative bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse min-w-[18px] text-center border-2 border-white md:border-0">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('MENU')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'MENU' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <ChefHat className="w-5 h-5" /> 菜單
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'SETTINGS' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            <Settings className="w-5 h-5" /> 設定
          </button>
        </div>
      </div>

      {activeTab === 'ORDERS' ? (
        <div className="space-y-6">
          {/* Filters & Sort - Minimalist Design */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-bold text-gray-400 mr-2 flex items-center gap-1"><Filter className="w-4 h-4" /> 狀態:</span>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  filterStatus === 'ALL' ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {Object.values(OrderStatus).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                    filterStatus === status ? 'bg-brand-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-bold text-gray-400 flex items-center gap-1"><ArrowUpDown className="w-4 h-4" /> 排序:</span>
              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full md:w-40 appearance-none bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow cursor-pointer hover:bg-white"
                >
                  <option value="NEWEST">最新訂單</option>
                  <option value="OLDEST">最舊訂單</option>
                  <option value="AMOUNT_HIGH">金額高 → 低</option>
                  <option value="AMOUNT_LOW">金額 低 → 高</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {processedOrders.length === 0 ? (
             <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 flex flex-col items-center">
               <LayoutDashboard className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-lg font-medium">沒有符合條件的訂單</p>
               <button onClick={() => {setFilterStatus('ALL'); setSortOption('NEWEST')}} className="mt-4 text-brand-600 hover:text-brand-700 font-bold text-sm">
                 清除篩選條件
               </button>
             </div>
          ) : (
            processedOrders.map(order => (
              <div key={order.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow relative overflow-hidden ${order.status === OrderStatus.PENDING ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
                {order.status === OrderStatus.PENDING && (
                    <div className="absolute top-0 right-0">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 animate-pulse">
                            <Bell className="w-3 h-3 fill-current" /> NEW
                        </span>
                    </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap pr-8">
                    <span className="font-mono text-xl font-black text-gray-900 tracking-tight">#{order.id.toString().slice(-4)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-medium text-gray-400 ml-auto md:ml-0">
                      {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {/* Customer Info Display */}
                  <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded-full shadow-sm"><User className="w-4 h-4 text-gray-500" /></div>
                      <span className="font-bold text-gray-900">{order.customerName || '未填寫'}</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded-full shadow-sm"><Phone className="w-4 h-4 text-gray-500" /></div>
                      <span className="font-mono text-gray-900">{order.customerPhone || '未填寫'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700 text-sm py-1 border-b border-gray-100 last:border-0">
                        <span className="font-medium">{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                        <span className="font-mono">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.customerNote && (
                     <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 flex gap-2">
                       <span className="font-bold flex-shrink-0">備註:</span> 
                       <span>{order.customerNote}</span>
                     </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-500 text-sm">訂單總計</span>
                    <span className="font-bold text-gray-900 text-2xl">${order.totalAmount}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:flex md:flex-col gap-3 md:w-32 md:border-l md:border-gray-100 md:pl-6 md:pt-0 border-t border-gray-100 pt-4">
                   <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.COOKING)}
                    disabled={order.status === OrderStatus.COOKING || order.status === OrderStatus.COMPLETED}
                    className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-2 py-3 md:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     <ChefHat className="w-4 h-4" /> 製作
                   </button>
                   <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.COMPLETED)}
                    disabled={order.status === OrderStatus.COMPLETED}
                    className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-2 py-3 md:py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     <CheckCircle className="w-4 h-4" /> 完成
                   </button>
                   <button 
                    onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)}
                    className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-2 py-3 md:py-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl font-bold text-xs md:text-sm transition-colors"
                   >
                     <X className="w-4 h-4" /> 取消
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'MENU' ? (
        <div>
          <div className="flex flex-col justify-between items-start gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
               <h2 className="text-xl font-bold text-gray-900">目前菜單 ({menu.length})</h2>
               <div className="flex gap-2 w-full md:w-auto">
                 <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="w-full md:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="搜尋餐點..."
                    />
                 </div>
                 <button 
                   onClick={handleOpenAddModal}
                   className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform whitespace-nowrap"
                 >
                   <Plus className="w-4 h-4" /> 新增
                 </button>
               </div>
            </div>

            {/* Admin Menu Category Filter - Quick Pills */}
            <div className="flex overflow-x-auto gap-2 no-scrollbar w-full pb-2">
                <button
                    onClick={() => setAdminCategoryFilter('ALL')}
                    className={`px-3 py-1 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
                        adminCategoryFilter === 'ALL'
                            ? 'bg-gray-800 text-white border-gray-800'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    全部
                </button>
                {Object.values(Category).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setAdminCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
                            adminCategoryFilter === cat
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdminMenu.length > 0 ? (
              filteredAdminMenu.map(item => (
                <div key={item.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                    
                    {/* Image Section */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                       <img 
                         src={item.imageUrl} 
                         alt={item.name} 
                         className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ${!item.isAvailable ? 'grayscale' : ''}`} 
                       />
                       
                       {/* Overlay Gradient */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                       {/* Category Badge */}
                       <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-bold rounded-full shadow-sm">
                           {item.category}
                         </span>
                       </div>

                       {/* Action Buttons */}
                       <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                            className="p-2 bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="編輯"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteMenuItem(item.id); }}
                            className="p-2 bg-white text-gray-700 hover:text-red-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>

                       {/* Sold Out Overlay */}
                       {!item.isAvailable && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                           <span className="text-white font-bold text-sm border border-white/50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                             已下架
                           </span>
                         </div>
                       )}
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col">
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.name}</h3>
                         <span className="font-bold text-brand-600 text-lg">${item.price}</span>
                       </div>
                       
                       <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
                         {item.description}
                       </p>

                       {/* Footer Action */}
                       <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.isAvailable ? '販售中' : '已停售'}
                          </span>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={item.isAvailable}
                              onChange={() => onToggleItemAvailability(item.id)}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                          </label>
                       </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100 flex flex-col items-center col-span-full">
                 <Search className="w-10 h-10 mb-3 opacity-30" />
                 <p className="font-medium">找不到符合的餐點</p>
                 <button onClick={() => { setMenuSearchQuery(''); setAdminCategoryFilter('ALL'); }} className="mt-2 text-brand-600 text-sm hover:underline">清除搜尋</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // SETTINGS TAB
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-brand-50 rounded-lg">
              <Store className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">商店設定</h2>
              <p className="text-sm text-gray-500">修改您的商店基本資訊與營業狀態</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">商店名稱</label>
              <input 
                type="text" 
                value={tempSettings.name}
                onChange={e => setTempSettings({...tempSettings, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white transition-colors"
                placeholder="例如：滋味點餐"
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tempSettings.isOpen ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">營業狀態</label>
                        <p className="text-xs text-gray-500">{tempSettings.isOpen ? '目前為營業中' : '目前為休息中'}</p>
                    </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={tempSettings.isOpen}
                        onChange={e => setTempSettings({...tempSettings, isOpen: e.target.checked})}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> 儲存設定
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Item Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up md:animate-none">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-lg font-bold">{editingId ? '編輯餐點' : '新增餐點'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
             </div>
             
             <form onSubmit={handleSubmitItem} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
               
               {/* Image Upload Section */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">餐點圖片</label>
                 <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden group">
                        {newItem.imageUrl ? (
                            <>
                                <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="text-white font-bold flex items-center gap-2">
                                        <Upload className="w-5 h-5" /> 更換圖片
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Image className="w-10 h-10 text-gray-400 mb-3" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-bold">點擊上傳</span> 或拖曳圖片</p>
                                <p className="text-xs text-gray-500">支援 PNG, JPG (建議 800x600)</p>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">餐點名稱</label>
                 <input 
                   required
                   type="text" 
                   value={newItem.name}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-base"
                   placeholder="例如：松露薯條"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">價格</label>
                   <input 
                     required
                     type="number" 
                     value={newItem.price || ''}
                     onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white text-base"
                     placeholder="0"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">分類</label>
                   <div className="flex flex-wrap gap-2">
                     {Object.values(Category).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewItem({...newItem, category: c})}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                            newItem.category === c 
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm ring-2 ring-brand-100' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {c}
                        </button>
                     ))}
                   </div>
                 </div>
               </div>

               <div>
                 <div className="mb-2">
                   <label className="block text-sm font-bold text-gray-700">描述</label>
                 </div>
                 <textarea 
                   required
                   value={newItem.description}
                   onChange={e => setNewItem({...newItem, description: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none h-28 resize-none bg-gray-50 focus:bg-white text-base"
                   placeholder="請輸入餐點描述..."
                 />
               </div>

               <button 
                 type="submit"
                 className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
               >
                 {editingId ? '儲存修改' : '確認新增'}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [mode, setMode] = useState<ViewMode>('CUSTOMER');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Connection State
  const [connectionError, setConnectionError] = useState(false);

  // Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: '滋味點餐',
    isOpen: true
  });
  
  // Shop Status Logic
  const isShopOpen = storeSettings.isOpen;

  // Load Initial Data from API
  const fetchData = useCallback(async () => {
    try {
      // Note: We don't setConnectionError(false) here to avoid flashing states.
      // We only clear error upon success.
      const [menuData, ordersData, settingsData] = await Promise.all([
        api.getMenu(),
        api.getOrders(),
        api.getSettings()
      ]);
      setMenu(menuData);
      setOrders(ordersData);
      setStoreSettings(settingsData);
      setConnectionError(false); // Success! Clear any previous errors.
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setConnectionError(true);
      // Optional: don't show toast if we are showing full screen error
      // showNotification('無法連接後端伺服器'); 
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Optional: Polling for new orders every 30 seconds
    const interval = setInterval(() => {
       // Just call fetchData, if it fails, it will set error state
       fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]); // Removed connectionError dependency

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Auth Logic
  const handleSwitchToAdmin = () => {
    if (isAdminLoggedIn) {
      setMode('ADMIN');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogin = () => {
    setIsAdminLoggedIn(true);
    setIsLoginModalOpen(false);
    setMode('ADMIN');
    showNotification('管理員登入成功');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setMode('CUSTOMER');
    showNotification('已登出後台');
  };

  // Cart Logic
  const addToCart = (item: MenuItem) => {
    if (!isShopOpen) {
      showNotification('目前非營業時間，無法點餐');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showNotification(`已將 ${item.name} 加入購物車`);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const submitOrder = async (customerName: string, customerPhone: string, customerNote: string) => {
    try {
      await api.createOrder({
        customerName,
        customerPhone,
        customerNote,
        totalAmount: cartTotal,
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity }))
      });
      setCart([]);
      setIsCartOpen(false);
      showNotification('訂單已送出！廚房準備中');
      fetchData(); // Refresh orders
    } catch (error) {
      console.error(error);
      showNotification('訂單送出失敗，請稍後再試');
    }
  };

  // Admin Logic
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showNotification('訂單狀態已更新');
    } catch (error) {
      showNotification('更新失敗');
    }
  };

  const addMenuItem = async (item: MenuItem) => {
    try {
      await api.addMenuItem(item);
      fetchData();
      showNotification('菜單已更新');
    } catch (error) {
      showNotification('新增失敗');
    }
  };

  const editMenuItem = async (updatedItem: MenuItem) => {
    try {
      await api.updateMenuItem(updatedItem);
      fetchData();
      showNotification('餐點資料已修改');
    } catch (error) {
      showNotification('修改失敗');
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (confirm('確定要刪除此餐點嗎？')) {
      try {
        await api.deleteMenuItem(id);
        fetchData();
        showNotification('餐點已刪除');
      } catch (error) {
        showNotification('刪除失敗');
      }
    }
  };

  const toggleItemAvailability = async (id: string) => {
    try {
      await api.toggleMenuItem(id);
      fetchData();
      showNotification('餐點狀態已切換');
    } catch (error) {
      showNotification('操作失敗');
    }
  };

  const updateSettings = async (newSettings: StoreSettings) => {
    try {
      await api.updateSettings(newSettings);
      setStoreSettings(newSettings);
      showNotification('商店設定已更新');
    } catch (error) {
      showNotification('設定更新失敗');
    }
  };

  if (connectionError) {
    return <ConnectionErrorScreen onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <Navbar 
        mode={mode} 
        onSwitchToAdmin={handleSwitchToAdmin}
        onLogout={handleLogout}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        storeName={storeSettings.name}
      />

      <main className="flex-1">
        {mode === 'CUSTOMER' ? (
          <CustomerMenu 
            menu={menu} 
            addToCart={addToCart} 
            isShopOpen={isShopOpen}
            storeName={storeSettings.name}
          />
        ) : (
          <AdminDashboard 
            orders={orders} 
            updateOrderStatus={updateOrderStatus}
            menu={menu}
            onAddMenuItem={addMenuItem}
            onEditMenuItem={editMenuItem}
            onDeleteMenuItem={deleteMenuItem}
            onToggleItemAvailability={toggleItemAvailability}
            settings={storeSettings}
            onUpdateSettings={updateSettings}
            refreshData={fetchData}
          />
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        submitOrder={submitOrder}
        total={cartTotal}
      />

      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in z-[70] min-w-[300px] justify-center">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Mobile Mode Switcher (Floating) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={mode === 'CUSTOMER' ? handleSwitchToAdmin : handleLogout}
          className={`p-4 rounded-full shadow-xl border hover:scale-110 transition-transform active:bg-gray-100 ${
             mode === 'CUSTOMER' 
               ? 'bg-white text-gray-800 border-gray-100' 
               : 'bg-red-50 text-red-500 border-red-100'
          }`}
        >
          {mode === 'CUSTOMER' ? <LayoutDashboard className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

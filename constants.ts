import { Category, MenuItem } from "./types";

export const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: '招牌紅燒牛肉麵',
    description: '嚴選頂級牛腱心，慢火燉煮八小時，湯頭濃郁回甘，麵條Q彈帶勁，每一口都是極致享受。',
    price: 180,
    category: Category.MAIN,
    imageUrl: 'https://picsum.photos/id/292/400/300',
    isAvailable: true
  },
  {
    id: '2',
    name: '黃金酥脆炸雞排',
    description: '獨家秘製醃料入味，外皮金黃酥脆，肉質鮮嫩多汁，咬下瞬間肉汁噴發，宵夜首選。',
    price: 95,
    category: Category.SNACK,
    imageUrl: 'https://picsum.photos/id/835/400/300',
    isAvailable: true
  },
  {
    id: '3',
    name: '經典珍珠奶茶',
    description: '每日現煮Q彈珍珠，搭配香醇錫蘭紅茶與濃郁奶香，黃金比例調配，台灣國民飲品經典重現。',
    price: 60,
    category: Category.DRINK,
    imageUrl: 'https://picsum.photos/id/425/400/300',
    isAvailable: true
  },
  {
    id: '4',
    name: '松露野菇燉飯',
    description: '義大利進口松露醬，融合多種新鮮野菇與帕瑪森起司，米粒吸飽高湯精華，香氣奢華迷人。',
    price: 280,
    category: Category.MAIN,
    imageUrl: 'https://picsum.photos/id/493/400/300',
    isAvailable: true
  },
  {
    id: '5',
    name: '法式檸檬塔',
    description: '酸甜清爽的檸檬凝乳，搭配酥脆塔皮，尾韻帶著淡淡奶油香氣，是餐後最完美的清新句點。',
    price: 120,
    category: Category.SNACK,
    imageUrl: 'https://picsum.photos/id/488/400/300',
    isAvailable: true
  }
];
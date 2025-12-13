'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, Trash2, ArrowLeft,
  CreditCard, Banknote, Smartphone, X, Check, Flame, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MenuItem, Category, CartItem, PaymentMethod } from '@/lib/types';
import { formatPrice, calculateCartTotal, getCategoryIcon } from '@/lib/utils';

export default function OrderPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 載入資料
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu'),
        ]);
        const cats = await catRes.json();
        const items = await menuRes.json();
        setCategories(cats);
        setMenuItems(items);
        if (cats.length > 0) {
          setSelectedCategory(cats[0].id);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  // 更新數量
  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev
      .map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  // 移除項目
  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const totalAmount = calculateCartTotal(cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 提交訂單
  const submitOrder = async (paymentMethod: PaymentMethod) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c => ({
            menuItemId: c.menuItem.id,
            quantity: c.quantity,
          })),
          paymentMethod,
        }),
      });
      const order = await response.json();
      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
      setCart([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentOptions: { method: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { method: 'CASH', icon: <Banknote className="w-8 h-8" />, label: '現金' },
    { method: 'CARD', icon: <CreditCard className="w-8 h-8" />, label: '信用卡' },
    { method: 'LINE_PAY', icon: <Smartphone className="w-8 h-8" />, label: 'LINE Pay' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-40 bg-[#0f0f1a]/90 glass border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首頁</span>
          </button>
          
          <h1 className="text-2xl font-bold ">
            選擇餐點
          </h1>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">{formatPrice(totalAmount)}</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#e94560] rounded-full text-xs font-bold flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋餐點..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>

        {/* 分類標籤 */}
        <div className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-tab flex items-center gap-2 ${
                  selectedCategory === cat.id ? 'category-tab-active' : 'category-tab-inactive'
                }`}
              >
                <span>{getCategoryIcon(cat.icon)}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 菜單網格 */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="menu-item-card group relative"
                onClick={() => addToCart(item)}
              >
                {item.is_popular === 1 && (
                  <div className="popular-badge flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    人氣
                  </div>
                )}

                <div className="aspect-square rounded-xl bg-gradient-to-br from-white/10 to-white/5 mb-3 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🍽️</div>
                </div>

                <h3 className="font-bold text-lg mb-1 group-hover:text-[#e94560] transition-colors">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-white/50 text-sm mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="price-tag text-xl">{formatPrice(item.price)}</span>
                  <div className="w-10 h-10 rounded-full bg-[#e94560] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">沒有找到符合的餐點</p>
          </div>
        )}
      </main>

      {/* 底部結帳按鈕 */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="sticky bottom-0 p-4 bg-[#0f0f1a]/90 glass border-t border-white/10"
        >
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-4 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-4"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>前往結帳</span>
            <span className="px-3 py-1 bg-white/20 rounded-lg">{formatPrice(totalAmount)}</span>
          </button>
        </motion.div>
      )}

      {/* 購物車側欄 */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1a2e] z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold">購物車</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/20" />
                      <p className="text-white/40">購物車是空的</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <motion.div key={item.menuItem.id} layout className="cart-item">
                          <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                            🍽️
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            <p className="price-tag">{formatPrice(item.menuItem.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.menuItem.id, -1)} className="quantity-btn">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItem.id, 1)} className="quantity-btn">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4 text-xl">
                      <span>總計</span>
                      <span className="price-tag font-bold">{formatPrice(totalAmount)}</span>
                    </div>
                    <button
                      onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                      className="w-full kiosk-btn-primary text-lg"
                    >
                      結帳付款
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 結帳彈窗 */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => !isProcessing && setIsCheckoutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg kiosk-card p-8"
              onClick={e => e.stopPropagation()}
            >
              {orderComplete ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">訂單完成！</h2>
                  <p className="text-white/60 mb-4">感謝您的訂購</p>
                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <p className="text-white/60 text-sm mb-1">取餐號碼</p>
                    <p className="text-4xl font-black text-[#fbbf24]">{orderNumber}</p>
                  </div>
                  <button
                    onClick={() => { setOrderComplete(false); setIsCheckoutOpen(false); router.push('/'); }}
                    className="kiosk-btn-primary w-full"
                  >
                    返回首頁
                  </button>
                </div>
              ) : isProcessing ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-xl">處理中，請稍候...</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2 text-center">選擇付款方式</h2>
                  <p className="text-white/60 text-center mb-6">
                    總金額：<span className="price-tag text-xl">{formatPrice(totalAmount)}</span>
                  </p>
                  <div className="grid gap-4">
                    {paymentOptions.map(option => (
                      <button
                        key={option.method}
                        onClick={() => submitOrder(option.method)}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#e94560] hover:bg-white/10 transition-all"
                      >
                        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                          {option.icon}
                        </div>
                        <span className="text-xl font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="w-full mt-6 kiosk-btn-secondary">
                    返回修改
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
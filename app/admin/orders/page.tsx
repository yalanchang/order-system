'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChefHat,
  Bell,
  Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/types';
import { formatPrice, formatDateTime } from '@/lib/utils';

// 狀態顏色
const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

// 狀態圖標
const statusIcons: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="w-5 h-5" />,
  CONFIRMED: <CheckCircle className="w-5 h-5" />,
  PREPARING: <ChefHat className="w-5 h-5" />,
  READY: <Bell className="w-5 h-5" />,
  COMPLETED: <Package className="w-5 h-5" />,
  CANCELLED: <XCircle className="w-5 h-5" />,
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 載入訂單
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' 
        ? '/api/orders' 
        : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // 每 30 秒自動更新
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // 更新訂單狀態
  const updateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 狀態篩選選項
  const filterOptions: { value: OrderStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: '全部' },
    { value: 'PENDING', label: '待處理' },
    { value: 'CONFIRMED', label: '已確認' },
    { value: 'PREPARING', label: '準備中' },
    { value: 'READY', label: '可取餐' },
    { value: 'COMPLETED', label: '已完成' },
    { value: 'CANCELLED', label: '已取消' },
  ];

  // 下一個狀態
  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'COMPLETED',
      COMPLETED: null,
      CANCELLED: null,
    };
    return flow[current];
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-40 bg-[#0f0f1a]/90 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首頁</span>
          </button>
          
          <h1 className="text-2xl font-bold">訂單管理</h1>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>

        {/* 狀態篩選 */}
        <div className="px-6 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === option.value
                    ? 'bg-[#e94560] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 訂單列表 */}
      <main className="p-6">
        {loading && orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#e94560] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">載入中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/40">沒有訂單</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {orders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#e94560]/50 transition-all"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* 訂單標頭 */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-[#fbbf24]">
                        #{order.order_number}
                      </span>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white ${statusColors[order.status]}`}>
                        {statusIcons[order.status]}
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>

                  {/* 訂單內容 */}
                  <div className="p-4">
                    {order.items && order.items.length > 0 ? (
                      <ul className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between text-sm">
                            <span className="text-white/80">
                              {item.menu_item_name} x{item.quantity}
                            </span>
                            <span className="text-white/60">
                              {formatPrice(item.subtotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white/40 text-sm mb-4">點擊查看詳情</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-white/60">
                        {order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] : '-'}
                      </span>
                      <span className="text-xl font-bold text-[#fbbf24]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 訂單詳情彈窗 */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* 標頭 */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">訂單詳情</h2>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white ${statusColors[selectedOrder.status]}`}>
                    {statusIcons[selectedOrder.status]}
                    {ORDER_STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>
                <p className="text-[#fbbf24] font-mono text-lg">
                  #{selectedOrder.order_number}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {formatDateTime(selectedOrder.created_at)}
                </p>
              </div>

              {/* 內容 */}
              <div className="p-6 max-h-[50vh] overflow-y-auto">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <div>
                          <span className="text-white font-medium">
                            {item.menu_item_name}
                          </span>
                          <span className="text-white/40 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-[#fbbf24]">
                          {formatPrice(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/40">無項目資料</p>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white/60">總計</span>
                  <span className="text-2xl font-bold text-[#fbbf24]">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>

                {selectedOrder.payment_method && (
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-white/60">付款方式</span>
                    <span className="text-white">
                      {PAYMENT_METHOD_LABELS[selectedOrder.payment_method]}
                    </span>
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              <div className="p-6 border-t border-white/10 space-y-3">
                {getNextStatus(selectedOrder.status) && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                    className="w-full py-3 bg-gradient-to-r from-[#e94560] to-[#ff6b6b] rounded-xl font-bold text-white"
                  >
                    更新為「{ORDER_STATUS_LABELS[getNextStatus(selectedOrder.status)!]}」
                  </button>
                )}

                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')}
                    className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30"
                  >
                    取消訂單
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20"
                >
                  關閉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: number;
  }
  
  export interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    category_id: number;
    is_available: number;
    is_popular: number;
    category_name?: string;
  }
  
  export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
  }
  
  export interface Order {
    id: number;
    order_number: string;
    status: OrderStatus;
    total_amount: number;
    payment_method: PaymentMethod | null;
    customer_name: string | null;
    table_number: string | null;
    notes: string | null;
    created_at: string;
    items?: OrderItem[];
  }
  
  export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    options: string | null;
    notes: string | null;
    menu_item_name?: string;
  }
  
  export type OrderStatus = 
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';
  
  export type PaymentMethod = 
    | 'CASH'
    | 'CARD'
    | 'LINE_PAY'
    | 'APPLE_PAY'
    | 'GOOGLE_PAY';
  
  export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: '待處理',
    CONFIRMED: '已確認',
    PREPARING: '準備中',
    READY: '可取餐',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  
  export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: '現金',
    CARD: '信用卡',
    LINE_PAY: 'LINE Pay',
    APPLE_PAY: 'Apple Pay',
    GOOGLE_PAY: 'Google Pay',
  };
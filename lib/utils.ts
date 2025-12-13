
/**
 * 格式化金額為台幣格式
 */
export function formatPrice(price: number): string {
    return `NT$ ${price.toLocaleString('zh-TW')}`;
  }
  
  /**
   * 產生訂單編號
   */
  export function generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6);
    return `${dateStr}-${timeStr}`;
  }
  
  /**
   * 計算購物車總金額
   */
  export function calculateCartTotal(items: { menuItem: { price: number }; quantity: number }[]): number {
    return items.reduce((total, item) => {
      return total + Number(item.menuItem.price) * item.quantity;
    }, 0);
  }
  
  /**
   * 格式化日期時間
   */
  export function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  /**
   * 分類圖標對應
   */
  export function getCategoryIcon(iconName: string | null): string {
    const iconMap: Record<string, string> = {
      flame: '🔥',
      utensils: '🍽️',
      cookie: '🍪',
      'cup-soda': '🥤',
      package: '📦',
    };
    return iconName ? iconMap[iconName] || '📋' : '📋';
  }
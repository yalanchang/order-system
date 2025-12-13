
CREATE DATABASE IF NOT EXISTS self_order_kiosk 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE self_order_kiosk;

-- 商品分類表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分類名稱',
    description VARCHAR(255) COMMENT '分類描述',
    icon VARCHAR(50) COMMENT '圖標名稱',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否啟用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分類';

-- 菜單項目表
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '餐點名稱',
    description VARCHAR(500) COMMENT '餐點描述',
    price DECIMAL(10,2) NOT NULL COMMENT '價格',
    image VARCHAR(255) COMMENT '圖片路徑',
    category_id INT NOT NULL COMMENT '分類ID',
    is_available TINYINT(1) DEFAULT 1 COMMENT '是否供應',
    is_popular TINYINT(1) DEFAULT 0 COMMENT '是否人氣商品',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜單項目';

-- 訂單表
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE COMMENT '訂單編號',
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') 
        DEFAULT 'PENDING' COMMENT '訂單狀態',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '總金額',
    payment_method ENUM('CASH', 'CARD', 'LINE_PAY', 'APPLE_PAY', 'GOOGLE_PAY') COMMENT '付款方式',
    customer_name VARCHAR(100) COMMENT '顧客姓名',
    table_number VARCHAR(10) COMMENT '桌號',
    notes TEXT COMMENT '備註',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL COMMENT '付款時間',
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='訂單';

-- 訂單項目表
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '訂單ID',
    menu_item_id INT NOT NULL COMMENT '餐點ID',
    quantity INT DEFAULT 1 COMMENT '數量',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '單價',
    subtotal DECIMAL(10,2) NOT NULL COMMENT '小計',
    options TEXT COMMENT '選項(JSON)',
    notes VARCHAR(255) COMMENT '備註',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='訂單項目';

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE menu_items;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入分類
INSERT INTO categories (name, description, icon, sort_order) VALUES
('人氣推薦', '最受歡迎的餐點', 'flame', 0),
('主食', '飯類、麵類', 'utensils', 1),
('小食', '炸物、點心', 'cookie', 2),
('飲料', '冷熱飲品', 'cup-soda', 3),
('套餐', '超值組合', 'package', 4);

-- 插入菜單項目
INSERT INTO menu_items (name, description, price, category_id, is_popular, image) VALUES
-- 人氣推薦
('招牌牛肉麵', '濃郁湯頭配上軟嫩牛肉', 180.00, 1, 1, '/images/beef-noodle.jpg'),
('黃金炸雞', '酥脆外皮、多汁內餡', 99.00, 1, 1, '/images/fried-chicken.jpg'),
('滷肉飯', '傳統古早味', 45.00, 2, 0, '/images/braised-pork.jpg'),
('雞腿飯', '香嫩雞腿配白飯', 120.00, 2, 0, '/images/chicken-rice.jpg'),
('排骨飯', '酥炸排骨便當', 110.00, 2, 0, '/images/pork-rice.jpg'),
('乾拌麵', '蔥油醬香拌麵', 65.00, 2, 0, '/images/dry-noodle.jpg'),
('海鮮炒飯', '蝦仁、花枝、蛋炒飯', 130.00, 2, 0, '/images/seafood-rice.jpg'),
('炸薯條', '金黃酥脆', 50.00, 3, 0, '/images/fries.jpg'),
('雞塊(6入)', '香酥雞塊', 60.00, 3, 0, '/images/nuggets.jpg'),
('洋蔥圈', '酥炸洋蔥圈', 55.00, 3, 0, '/images/onion-rings.jpg'),
('蘿蔔糕', '香煎蘿蔔糕', 40.00, 3, 0, '/images/radish-cake.jpg'),
('滷味拼盤', '豆干、海帶、滷蛋', 80.00, 3, 0, '/images/braised-snacks.jpg'),
('珍珠奶茶', '經典手搖飲', 55.00, 4, 0, '/images/bubble-tea.jpg'),
('檸檬綠茶', '清爽解膩', 40.00, 4, 0, '/images/lemon-tea.jpg'),
('可樂', '冰涼暢快', 30.00, 4, 0, '/images/cola.jpg'),
('柳橙汁', '新鮮果汁', 45.00, 4, 0, '/images/orange-juice.jpg'),
('熱美式', '香濃咖啡', 50.00, 4, 0, '/images/americano.jpg'),
('經典套餐A', '雞腿飯+小菜+飲料', 159.00, 5, 0, '/images/combo-a.jpg'),
('超值套餐B', '牛肉麵+小菜+飲料', 219.00, 5, 0, '/images/combo-b.jpg'),
('歡樂分享餐', '炸雞+薯條+雞塊+飲料x2', 299.00, 5, 0, '/images/combo-share.jpg');


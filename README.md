# 自助點餐收銀系統

使用 **Next.js + React + MySQL** 開發的自助點餐系統

## 功能

- 現代化深色主題 UI
- 響應式設計
- 購物車（新增、修改、刪除）
- 多元支付（現金、信用卡、LINE Pay）
- 搜尋餐點
- 分類瀏覽

## 技術架構

| 類別 | 技術 |
|------|------|
| 前端 | Next.js 14, React 18, TypeScript |
| 樣式 | Tailwind CSS, Framer Motion |
| 資料庫 | MySQL + mysql2（原生 SQL） |

## 專案結構

self-order-kiosk/
├── app/
│   ├── api/
│   │   ├── categories/route.ts   # 分類 API
│   │   ├── menu/route.ts         # 菜單 API
│   │   └── orders/               # 訂單 API
│   ├── order/page.tsx            # 點餐頁面
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # 首頁
├── lib/
│   ├── db.ts                     # MySQL 連線
│   ├── types.ts                  # 型別定義
│   └── utils.ts                  # 工具函數
├── sql/
│   ├── create_tables.sql         # 建表 SQL
│   └── seed_data.sql             # 測試資料
├── .env.example
└── package.json

API 端點
分類

GET /api/categories - 取得所有分類
POST /api/categories - 新增分類

菜單

GET /api/menu - 取得菜單
GET /api/menu?categoryId=1 - 依分類篩選
GET /api/menu?search=雞 - 搜尋
POST /api/menu - 新增餐點

訂單

GET /api/orders - 取得訂單列表
POST /api/orders - 建立訂單
GET /api/orders/[id] - 取得單一訂單
PATCH /api/orders/[id] - 更新訂單狀態
DELETE /api/orders/[id] - 刪除訂單
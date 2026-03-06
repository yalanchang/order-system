# 🍽️ 自助點餐收銀系統

> 使用 **Next.js + React + MySQL** 開發的自助點餐 Kiosk 系統，提供現代化深色主題 UI 與流暢的點餐體驗。

-----

## ✨ 功能特色

- 🌙 **現代化深色主題 UI**：視覺舒適、風格統一
- 📱 **響應式設計**：支援各種螢幕尺寸
- 🛒 **購物車管理**：新增、修改、刪除餐點
- 💳 **多元支付方式**：現金、信用卡、LINE Pay
- 🔍 **餐點搜尋**：快速找到想要的餐點
- 🗂️ **分類瀏覽**：依類別瀏覽菜單

-----

## 🛠️ 技術架構

|類別  |技術                              |
|----|--------------------------------|
|前端框架|Next.js 14, React 18, TypeScript|
|樣式  |Tailwind CSS, Framer Motion     |
|資料庫 |MySQL + mysql2（原生 SQL）          |

-----

## 📁 專案結構

```
order-system/
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
│   ├── db.ts                     # MySQL 連線設定
│   ├── types.ts                  # TypeScript 型別定義
│   └── utils.ts                  # 工具函數
├── add.sql                       # 資料庫 SQL 腳本
├── next.config.js
├── tailwind.config.ts
└── package.json
```




## 📡 API 端點

### 分類

|方法  |路徑               |說明    |
|----|-----------------|------|
|GET |`/api/categories`|取得所有分類|
|POST|`/api/categories`|新增分類  |

### 菜單

|方法  |路徑                      |說明    |
|----|------------------------|------|
|GET |`/api/menu`             |取得完整菜單|
|GET |`/api/menu?categoryId=1`|依分類篩選 |
|GET |`/api/menu?search=雞`    |搜尋餐點  |
|POST|`/api/menu`             |新增餐點  |

### 訂單

|方法    |路徑                |說明    |
|------|------------------|------|
|GET   |`/api/orders`     |取得訂單列表|
|POST  |`/api/orders`     |建立訂單  |
|GET   |`/api/orders/[id]`|取得單一訂單|
|PATCH |`/api/orders/[id]`|更新訂單狀態|
|DELETE|`/api/orders/[id]`|刪除訂單  |




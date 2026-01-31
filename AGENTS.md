# Link Shortener 專案的 Agent 指令

本文件作為 LLM agents 和開發者在 Link Shortener 專案上工作的中央指南。 它概述了核心原則、最佳實踐和技術棧細節，以確保一致性和高品質的代碼庫。

## ⚠️ 重要：開發前必讀
> 所有技術決策、代碼模式和實作細節都已在文件中詳細說明。請優先閱讀相關的 .md 文件，然後再開始編寫程式碼。

## 🎯 核心原則

### 1. 類型安全優先

```typescript
// ✅ 始終定義明確的類型
const user: User = { id: "1", email: "test@example.com" };

// ❌ 永遠不要使用 any
const user: any = { ... };
```

### 2. 元件優先開發

```typescript
// ✅ 使用帶類型的函數式元件
interface ButtonProps { label: string; onClick: () => void; }
export function Button({ label, onClick }: ButtonProps): JSX.Element { ... }
```

### 3. 資料庫類型安全

```typescript
// ✅ 從 schema 推斷類型
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

### 4. 一致的錯誤處理

```typescript
// ✅ 使用帶類型的錯誤回應
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
return NextResponse.json({ success: true, data: result }, { status: 200 });
```

### 5. 可擴展的組織結構

```
app/
  ├── links/
  │   ├── components/
  │   ├── actions.ts
  │   ├── page.tsx
  │   └── layout.tsx
```

## 📦 技術棧提醒

| Layer          | Technology            | Notes                            |
| -------------- | --------------------- | -------------------------------- |
| **Frontend**   | React 19 + Next.js 16 | App Router, Server Components    |
| **Styling**    | Tailwind CSS 4        | Use CVA for components           |
| **Language**   | TypeScript 5          | Strict mode enabled              |
| **Backend**    | Next.js API Routes    | Server Actions supported         |
| **Database**   | PostgreSQL (Neon)     | Serverless, with Drizzle ORM     |
| **Auth**       | Clerk                 | User authentication & management |
| **UI Library** | shadcn/ui             | Component library (ONLY)         |
| **Icons**      | Lucide React          | SVG icons                        |


## 📚 文件標準

所有函數和元件都應該有 JSDoc 註釋：

```typescript
/**
 * 建立縮短的 URL 連結
 * @param originalUrl - 要縮短的長 URL
 * @param customCode - 可選的自定義短碼
 * @returns 建立的連結物件
 * @throws {ValidationError} 如果 URL 無效
 * @example
 * const link = await createLink("https://example.com");
 */
```

```

## 🔐 安全性檢查清單

- [ ] 使用 Zod schemas 驗證輸入
- [ ] 沒有硬編碼的秘密或憑證
- [ ] 環境變數適當類型化
- [ ] 受保護路由的身份驗證檢查
- [ ] 防止 SQL 注入（使用 ORM）
- [ ] XSS 防護（React 轉義 + 清理）
- [ ] 如需要配置 CORS
- [ ] 考慮限速

## 🎯 效能檢查清單

- [ ] 需要時對元件進行 memoize
- [ ] 使用 Next.js Image 優化圖片
- [ ] 對較大的元件進行代碼分割
- [ ] 優化資料庫查詢
- [ ] 對列表實現分頁
- [ ] 防止不必要的重新渲染
- [ ] 監控 bundle 大小

## 📞 有問題？

當您遇到未涵蓋的情況時：

1. 檢查相關的文件檔案
2. 尋找類似的現有程式碼
3. 遵循原則：「類型安全和明確」
4. 為未來參考記錄決定/模式

## 🔄 持續改進

這些指南會不斷演進。如果您發現：

- 缺少指導
- 過時的模式
- 更好的實踐
- 不清楚的文件

請更新相關檔案並通知團隊。

---

**專案**：Link Shortener
**建立日期**：2026-01-18
**狀態**：活躍
**維護者**：Belli Wu
```

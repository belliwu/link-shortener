# Link Shortener 專案的 Agent 指令

本文件作為 LLM agents 和開發者在 Link Shortener 專案上工作的中央指南。所有程式碼貢獻必須遵守 `/docs` 目錄中概述的編碼標準和最佳實踐。

## ⚠️ 重要：開發前必讀

> **在開發任何代碼之前，必須始終閱讀 `/docs` 目錄中的相關說明文件，這一點至關重要。**
>
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

## 🔍 開發功能時

### 建立新元件

1. 查看 [UI 標準](./docs/UI_STANDARDS.md) - **僅使用 shadcn/ui 元件**
2. 參考 [React 模式](./docs/REACT_PATTERNS.md) 以了解結構
3. 使用 [檔案慣例](./docs/FILE_NAMING_CONVENTIONS.md) 中的命名規則
4. 應用 [TS 標準](./docs/TYPESCRIPT_STANDARDS.md) 中的 TypeScript 規範
5. 使用 Tailwind 進行樣式自訂

### 添加資料庫 Schema

1. 參考 [資料庫模式](./docs/DATABASE_PATTERNS.md)
2. 在 `db/schema.ts` 中定義表格
3. 為 TypeScript 推斷類型
4. 使用適當的關係和約束

### 建立 API 端點

1. 遵循 [API 標準](./docs/API_STANDARDS.md)
2. 使用 Zod 驗證輸入
3. 使用 [程式碼品質](./docs/CODE_QUALITY.md) 中的錯誤處理
4. 返回帶類型的回應

### 管理狀態

1. 檢視 [狀態管理](./docs/STATE_MANAGEMENT.md)
2. 選擇：hooks、context 或 server actions
3. 保持元件純粹且可測試

### 處理身份驗證

1. 參考 [身份驗證標準](./docs/AUTHENTICATION.md)
2. **僅使用 Clerk** 進行身份驗證
3. 受保護路由使用 proxy (Next.js 16+)
4. 登入/註冊使用模態框模式

### 處理錯誤

1. 定義自定義錯誤類別
2. 使用結構化日誌記錄
3. 返回適當的 HTTP 狀態碼
4. 提供有用的用戶消息

## ✅ 程式碼審查檢查清單

提交程式碼前，確保：

- [ ] **TypeScript**：所有類型都明確定義，不使用 `any`
- [ ] **檔案**：遵循命名慣例，正確的位置
- [ ] **元件**：React 最佳實踐，適當的 props 類型
- [ ] **UI**：僅使用 shadcn/ui 元件，不建立自定義基礎元件
- [ ] **資料庫**：類型安全查詢，適當的錯誤處理
- [ ] **API**：驗證、錯誤回應、適當的狀態碼
- [ ] **身份驗證**：僅使用 Clerk，受保護路由檢查（使用 proxy），模態框登入
- [ ] **樣式**：Tailwind classes，CVA 用於變體
- [ ] **測試**：工具函數的單元測試，元件測試
- [ ] **文件**：函數/元件的 JSDoc 註釋
- [ ] **安全性**：輸入驗證，沒有硬編碼的秘密
- [ ] **效能**：沒有不必要的渲染，優化的導入

## 🚀 工作流程

### 開始新任務

1. 從 `/docs` 閱讀相關文件
2. 檢查現有類似的程式碼以了解模式
3. 遵循標準實作
4. 徹底測試
5. 進行程式碼審查

### 範例：建立連結表單元件

```typescript
// 1. 定義類型
interface CreateLinkFormProps {
  onSuccess?: () => void;
}

// 2. 建立元件
export function CreateLinkForm({ onSuccess }: CreateLinkFormProps): JSX.Element {
  // 使用 STATE_MANAGEMENT.md 中的模式
  const [error, setError] = useState<string | null>(null);

  // 使用 API_STANDARDS.md 中的 server action
  const handleSubmit = async (data: FormData) => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 使用 CVA 樣式化元件 */}
      {error && <ErrorAlert message={error} />}
    </form>
  );
}

// 3. 使用適當的命名導出 (FILE_NAMING_CONVENTIONS.md)
// 檔案： app/links/CreateLinkForm.tsx

// 4. 測試 (CODE_QUALITY.md)
describe("CreateLinkForm", () => {
  it("should submit valid form data", () => { ... });
});
```

## 🛠️ 常見任務

### 建立新頁面

- 位置：`app/[feature]/page.tsx`
- 遵循：[React 模式](./docs/REACT_PATTERNS.md)
- 在 layout.tsx 中添加 metadata

### 添加資料庫服務

- 位置：`db/services/[feature]Service.ts`
- 使用：[資料庫模式](./docs/DATABASE_PATTERNS.md) 中的 Drizzle 模式
- 導出帶類型的函數

### 建立 API 路由

- 位置：`app/api/[feature]/route.ts`
- 遵循：[API 標準](./docs/API_STANDARDS.md)
- 使用 Zod 驗證，處理錯誤

### 添加自定義 Hook

- 位置：`lib/hooks/use[Feature].ts`
- 模式：[狀態管理](./docs/STATE_MANAGEMENT.md)
- 包含 JSDoc 和範例

### 編寫測試

- 位置：`__tests__/[path].test.ts(x)`
- 參考：[程式碼品質](./docs/CODE_QUALITY.md)
- 關鍵路徑目標 80%+ 覆蓋率

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

請更新 `/docs` 中的相關檔案並通知團隊。

---

**專案**：Link Shortener
**建立日期**：2026-01-18
**狀態**：活躍
**維護者**：Belli Wu
```

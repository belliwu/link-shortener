---
description: Read this document before implementing data mutations via server actions in the Link Shortener project.
applyTo: **/*.ts, **/*.tsx
---

# Server Actions 與資料變更標準（Server Actions & Data Mutations Standards）

本文件定義了 Link Shortener 專案中透過 Server Actions 處理所有資料變更操作的標準和最佳實踐。

## 🎯 核心原則

### ⚠️ 重要規則

> **唯一的資料變更方法**：本專案中的**所有資料變更**（mutations）都必須透過 Server Actions 進行。
> 絕對**不要**在 API Routes 或客戶端元件中直接執行資料變更操作。

> **不拋出錯誤**：Server actions **絕對不應該**拋出錯誤到客戶端。
> 所有錯誤都必須被捕獲並轉換為包含 `success: false` 和 `error` 訊息的回應物件。

## 📋 Server Actions 要求

### 1. 檔案命名與位置

Server Actions 必須遵循嚴格的檔案組織規範：

```typescript
// ✅ 正確：actions.ts 與呼叫它的元件放在同一目錄
app/
  ├── dashboard/
  │   ├── actions.ts          // ✅ Server actions
  │   ├── page.tsx            // 呼叫 actions.ts 的元件
  │   └── components/
  │       └── link-form.tsx   // 也可以呼叫 actions.ts
  ├── links/
  │   ├── actions.ts          // ✅ Links 功能的 server actions
  │   └── page.tsx

// ❌ 錯誤：集中式 actions 檔案或錯誤命名
app/
  ├── actions/
  │   └── all-actions.ts      // ❌ 不要集中管理
  ├── dashboard/
  │   ├── serverActions.ts    // ❌ 檔名必須是 actions.ts
  │   └── page.tsx
```

**規則**：

- Server action 檔案**必須**命名為 `actions.ts`
- Server action 檔案**必須**與呼叫它的元件放在同一目錄（colocated）
- 每個功能模組應有自己的 `actions.ts`

### 2. 從客戶端元件呼叫

Server Actions 應該從客戶端元件（Client Components）呼叫：

```typescript
// ✅ 正確：從客戶端元件呼叫 server action
'use client';

import { createLink } from './actions';
import { useState } from 'react';

export function LinkForm() {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      url: formData.get('url') as string,
      customCode: formData.get('customCode') as string,
    };

    const result = await createLink(data);
    setIsPending(false);

    if (!result.success) {
      // 處理錯誤
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. TypeScript 類型定義

**絕對不要**使用 `FormData` 作為 TypeScript 類型：

```typescript
// ❌ 錯誤：使用 FormData 類型
export async function createLink(formData: FormData) { ... }

// ✅ 正確：定義明確的介面
interface CreateLinkInput {
  url: string;
  customCode?: string;
  userId: string;
}

export async function createLink(input: CreateLinkInput) { ... }
```

**規則**：

- 為所有 server action 輸入定義明確的 TypeScript 介面
- 使用有意義的介面名稱（例如：`CreateLinkInput`, `UpdateLinkInput`）
- 避免使用 `any` 或 `FormData` 類型

### 4. 資料驗證（Zod）

所有傳入 server action 的資料**必須**使用 Zod 進行驗證：

```typescript
// ✅ 正確：使用 Zod 的 safeParse 進行驗證（不拋出錯誤）
import { z } from "zod";

// 定義 Zod schema
const createLinkSchema = z.object({
  url: z.string().url("必須是有效的 URL"),
  customCode: z.string().min(3).max(20).optional(),
  userId: z.string().min(1),
});

// 從 Zod schema 推斷 TypeScript 類型
type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(input: CreateLinkInput) {
  // ✅ 使用 safeParse 驗證輸入（不會拋出錯誤）
  const validation = createLinkSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  const validatedData = validation.data;
  // 繼續處理...
}

// ❌ 錯誤：使用 parse() 會拋出錯誤
export async function createLink(input: CreateLinkInput) {
  const validatedData = createLinkSchema.parse(input); // ❌ 會拋出錯誤！
  // ...
}

// ❌ 錯誤：沒有驗證
export async function createLink(input: CreateLinkInput) {
  // 直接使用未驗證的資料
  const link = await db.insert(links).values(input);
}
```

**驗證最佳實踐**：

- ✅ **必須使用** `.safeParse()` 進行驗證（不會拋出錯誤）
- ❌ **絕對不要**使用 `.parse()`（會拋出錯誤）
- 在 server action 開始時立即驗證資料
- 驗證失敗時返回 `{ success: false, error: "..." }` 物件
- 從 Zod schema 推斷 TypeScript 類型以保持一致性

### 5. 身份驗證檢查

**所有** server actions 在執行資料庫操作前，**必須**先檢查使用者是否已登入：

```typescript
// ✅ 正確：首先檢查身份驗證
import { auth } from "@clerk/nextjs/server";

export async function createLink(input: CreateLinkInput) {
  // 1️⃣ 首先驗證使用者身份
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "未授權：請先登入",
    };
  }

  // 2️⃣ 驗證輸入資料
  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  // 3️⃣ 執行資料庫操作
  const link = await createLinkInDb({
    ...validation.data,
    userId,
  });

  return {
    success: true,
    data: link,
  };
}

// ❌ 錯誤：沒有身份驗證檢查
export async function createLink(input: CreateLinkInput) {
  const link = await createLinkInDb(input); // ❌ 安全風險！
  return { success: true, data: link };
}
```

**身份驗證檢查順序**：

1. ✅ 檢查使用者身份（`auth()`）
2. ✅ 驗證輸入資料（Zod）
3. ✅ 執行資料庫操作（透過 helper functions）

### 6. 資料庫操作（透過 Helper Functions）

Server actions **不應該**直接包含 Drizzle 查詢。所有資料庫操作必須透過位於 `/data` 目錄的 helper functions 進行：

```typescript
// ❌ 錯誤：在 server action 中直接使用 Drizzle
import { db } from "@/db";
import { links } from "@/db/schema";

export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "未授權" };

  // ❌ 不要在這裡直接使用 Drizzle
  const link = await db
    .insert(links)
    .values({
      ...input,
      userId,
    })
    .returning();

  return { success: true, data: link[0] };
}

// ✅ 正確：使用 /data 目錄中的 helper function
import { createLinkInDb } from "@/data/links";

export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "未授權" };

  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  // ✅ 透過 helper function 執行資料庫操作
  const link = await createLinkInDb({
    ...validation.data,
    userId,
  });

  return { success: true, data: link };
}
```

**Helper Functions 位置**：

```
data/
  ├── links.ts          // Links 相關的資料庫操作
  ├── users.ts          // Users 相關的資料庫操作
  └── analytics.ts      // Analytics 相關的資料庫操作
```

**Helper Function 範例**：

```typescript
// data/links.ts
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 在資料庫中建立新的連結
 */
export async function createLinkInDb(data: {
  url: string;
  customCode?: string;
  userId: string;
}) {
  const [link] = await db
    .insert(links)
    .values({
      originalUrl: data.url,
      shortCode: data.customCode || generateShortCode(),
      userId: data.userId,
      createdAt: new Date(),
    })
    .returning();

  return link;
}

/**
 * 根據 ID 更新連結
 */
export async function updateLinkInDb(
  linkId: string,
  data: Partial<typeof links.$inferInsert>,
) {
  const [updated] = await db
    .update(links)
    .set(data)
    .where(eq(links.id, linkId))
    .returning();

  return updated;
}
```

### 7. 錯誤處理與回應格式

**重要**：Server actions **絕對不應該拋出錯誤**。所有錯誤情況都必須被處理並返回包含錯誤訊息的回應物件。

使用一致的回應格式來處理成功和錯誤情況：

```typescript
// 定義標準回應類型
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ✅ 正確：不拋出錯誤，始終返回回應物件
export async function createLink(
  input: CreateLinkInput,
): Promise<ActionResponse<Link>> {
  // 1. 檢查身份驗證
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "未授權：請先登入",
    };
  }

  // 2. 驗證輸入（使用 safeParse，不會拋出錯誤）
  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  // 3. 執行資料庫操作（用 try-catch 包裹以防未預期錯誤）
  try {
    const link = await createLinkInDb({ ...validation.data, userId });
    return {
      success: true,
      data: link,
    };
  } catch (error) {
    // 捕獲任何資料庫錯誤並轉換為回應物件
    console.error("建立連結失敗:", error);
    return {
      success: false,
      error: "建立連結時發生錯誤",
    };
  }
}

// ❌ 錯誤：拋出錯誤到客戶端
export async function createLink(
  input: CreateLinkInput,
): Promise<ActionResponse<Link>> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("未授權"); // ❌ 不要拋出錯誤！
  }

  const validatedData = createLinkSchema.parse(input); // ❌ parse 會拋出錯誤！
  const link = await createLinkInDb({ ...validatedData, userId });
  return { success: true, data: link };
}
```

**錯誤處理原則**：

- ✅ 始終返回 `ActionResponse` 類型的物件
- ✅ 使用 `.safeParse()` 進行驗證（不會拋出錯誤）
- ✅ 用 try-catch 包裹資料庫操作，捕獲未預期的錯誤
- ✅ 將所有錯誤轉換為使用者友善的錯誤訊息
- ❌ **絕對不要**讓錯誤拋出到客戶端
- ❌ **絕對不要**使用 `.parse()`（會拋出錯誤）
- ❌ **絕對不要**使用 `throw new Error()`

## 📝 完整範例

以下是一個完整的 server action 實作範例：

```typescript
// app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createLinkInDb, updateLinkInDb, deleteLinkInDb } from "@/data/links";

// 回應類型
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Zod schemas
const createLinkSchema = z.object({
  url: z.string().url("必須是有效的 URL"),
  customCode: z.string().min(3, "自訂代碼至少需要 3 個字元").max(20).optional(),
});

const updateLinkSchema = z.object({
  id: z.string(),
  url: z.string().url("必須是有效的 URL").optional(),
  customCode: z.string().min(3).max(20).optional(),
  isActive: z.boolean().optional(),
});

// TypeScript 類型
type CreateLinkInput = z.infer<typeof createLinkSchema>;
type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

/**
 * 建立新的短連結
 */
export async function createLink(
  input: CreateLinkInput,
): Promise<ActionResponse<Link>> {
  // 1. 檢查身份驗證
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "未授權：請先登入" };
  }

  // 2. 驗證輸入（使用 safeParse，不會拋出錯誤）
  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  // 3. 執行資料庫操作（用 try-catch 包裹）
  try {
    const link = await createLinkInDb({
      ...validation.data,
      userId,
    });

    // 4. 重新驗證相關路徑
    revalidatePath("/dashboard");

    return { success: true, data: link };
  } catch (error) {
    // 捕獲任何資料庫錯誤
    console.error("建立連結失敗:", error);
    return { success: false, error: "建立連結時發生錯誤" };
  }
}

/**
 * 更新現有連結
 */
export async function updateLink(
  input: UpdateLinkInput,
): Promise<ActionResponse<Link>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "未授權：請先登入" };
  }

  const validation = updateLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  const { id, ...updateData } = validation.data;

  try {
    const link = await updateLinkInDb(id, updateData, userId);

    if (!link) {
      return { success: false, error: "找不到連結或無權限更新" };
    }

    revalidatePath("/dashboard");

    return { success: true, data: link };
  } catch (error) {
    console.error("更新連結失敗:", error);
    return { success: false, error: "更新連結時發生錯誤" };
  }
}

/**
 * 刪除連結
 */
export async function deleteLink(
  linkId: string,
): Promise<ActionResponse<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "未授權：請先登入" };
    }

    const deleted = await deleteLinkInDb(linkId, userId);

    if (!deleted) {
      return { success: false, error: "找不到連結或無權限刪除" };
    }

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("刪除連結失敗:", error);
    return { success: false, error: "刪除連結時發生錯誤" };
  }
}
```

## ✅ 檢查清單

在實作 server action 之前，請確認：

- [ ] Server action 檔案命名為 `actions.ts`
- [ ] Server action 與呼叫它的元件放在同一目錄
- [ ] 使用明確的 TypeScript 介面（不使用 `FormData` 類型）
- [ ] 使用 Zod 的 `.safeParse()` 驗證所有輸入資料（不使用 `.parse()`）
- [ ] Server action 不拋出任何錯誤，所有錯誤都轉換為回應物件
- [ ] 在執行資料庫操作前檢查使用者身份驗證
- [ ] 透過 `/data` 目錄的 helper functions 執行資料庫操作
- [ ] 不在 server action 中直接使用 Drizzle 查詢
- [ ] 使用一致的 `ActionResponse` 回應格式
- [ ] 適當的錯誤處理和使用者友善的錯誤訊息
- [ ] 在資料變更後使用 `revalidatePath()` 或 `revalidateTag()`

## 🚫 常見錯誤

避免這些常見錯誤：

### ❌ 錯誤 1：在 API Route 中進行資料變更

```typescript
// ❌ 不要這樣做
// app/api/links/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  const link = await db.insert(links).values(data);
  return Response.json(link);
}
```

### ❌ 錯誤 2：使用 FormData 類型

```typescript
// ❌ 不要這樣做
export async function createLink(formData: FormData) { ... }
```

### ❌ 錯誤 3：在 server action 中直接使用 Drizzle

```typescript
// ❌ 不要這樣做
export async function createLink(input: CreateLinkInput) {
  const link = await db.insert(links).values(input).returning();
  return link;
}
```

### ❌ 錯誤 4：沒有驗證使用者身份

```typescript
// ❌ 不要這樣做
export async function createLink(input: CreateLinkInput) {
  // 沒有 auth 檢查！
  const link = await createLinkInDb(input);
  return link;
}
```

### ❌ 錯誤 5：集中式 actions 檔案

```typescript
// ❌ 不要這樣做
// app/actions/all-actions.ts - 集中管理所有 actions
export async function createLink() { ... }
export async function createUser() { ... }
export async function updateProfile() { ... }
```

### ❌ 錯誤 6：拋出錯誤到客戶端

```typescript
// ❌ 不要這樣做
export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("未授權"); // ❌ 不要拋出錯誤！
  }

  // ❌ parse() 會在驗證失敗時拋出錯誤
  const validatedData = createLinkSchema.parse(input);

  const link = await createLinkInDb({ ...validatedData, userId });
  return { success: true, data: link };
}

// ✅ 正確：返回錯誤物件
export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "未授權：請先登入" }; // ✅ 返回錯誤物件
  }

  // ✅ safeParse() 不會拋出錯誤
  const validation = createLinkSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: `驗證失敗：${validation.error.errors[0].message}`,
    };
  }

  try {
    const link = await createLinkInDb({ ...validation.data, userId });
    return { success: true, data: link };
  } catch (error) {
    console.error("建立連結失敗:", error);
    return { success: false, error: "建立連結時發生錯誤" };
  }
}
```

## 📚 相關文件

- [身份驗證標準](./authentication.instructions.md) - 如何使用 Clerk 進行身份驗證
- [資料獲取指南](./data-fetching.instructions.md) - 如何獲取和讀取資料
- [UI 元件標準](./ui_standards.instructions.md) - 如何建立客戶端元件

---

**建立日期**：2026-01-31  
**維護者**：Link Shortener 開發團隊

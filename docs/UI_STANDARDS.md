# UI 元件標準（UI Component Standards）

本文件定義了 Link Shortener 專案中使用 shadcn/ui 建構使用者介面的標準和最佳實踐。

## 🎨 核心原則

### ⚠️ 重要規則

> **唯一的 UI 元件庫**：本專案**僅**使用 shadcn/ui 元件。
> 絕對**不要**建立自定義 UI 元件或使用其他 UI 庫。

## 📋 shadcn/ui 配置

### 1. 安装組件

使用 CLI 添加需要的 shadcn/ui 元件：

```bash
# ✅ 正確的方式：使用 shadcn CLI
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog

# 查看可用的元件
npx shadcn@latest add
```

### 2. 元件位置

shadcn/ui 元件會自動安裝到：

```
components/
  └── ui/
      ├── button.tsx
      ├── card.tsx
      ├── input.tsx
      ├── dialog.tsx
      └── ...
```

## ✅ 使用 shadcn/ui 元件

### 基本按鈕

```typescript
// ✅ 使用 shadcn/ui Button
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <div>
      <Button>預設按鈕</Button>
      <Button variant="destructive">刪除</Button>
      <Button variant="outline">外框按鈕</Button>
      <Button variant="ghost">幽靈按鈕</Button>
      <Button size="sm">小按鈕</Button>
      <Button size="lg">大按鈕</Button>
    </div>
  );
}
```

```typescript
// ❌ 錯誤：不要建立自定義按鈕元件
export function CustomButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-500 rounded">
      {children}
    </button>
  );
}
```

### 卡片元件

```typescript
// ✅ 使用 shadcn/ui Card
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export function LinkCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>縮短連結</CardTitle>
        <CardDescription>建立你的短連結</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 內容 */}
      </CardContent>
      <CardFooter>
        {/* 頁尾 */}
      </CardFooter>
    </Card>
  );
}
```

### 輸入欄位

```typescript
// ✅ 使用 shadcn/ui Input
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UrlInput() {
  return (
    <div className="space-y-2">
      <Label htmlFor="url">原始 URL</Label>
      <Input
        id="url"
        type="url"
        placeholder="https://example.com"
      />
    </div>
  );
}
```

### 對話框/模態框

```typescript
// ✅ 使用 shadcn/ui Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function CreateLinkDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>建立連結</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新的短連結</DialogTitle>
          <DialogDescription>
            輸入你想要縮短的 URL
          </DialogDescription>
        </DialogHeader>
        {/* 表單內容 */}
      </DialogContent>
    </Dialog>
  );
}
```

### 表單元件

```typescript
// ✅ 使用 shadcn/ui Form（結合 react-hook-form）
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  url: z.string().url({ message: '請輸入有效的 URL' }),
  customCode: z.string().optional(),
});

export function CreateLinkForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      customCode: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>原始 URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                輸入要縮短的完整 URL
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">建立連結</Button>
      </form>
    </Form>
  );
}
```

### 資料表格

```typescript
// ✅ 使用 shadcn/ui Table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
}

export function LinksTable({ links }: { links: Link[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>短碼</TableHead>
          <TableHead>原始 URL</TableHead>
          <TableHead>點擊次數</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell>{link.shortCode}</TableCell>
            <TableCell>{link.originalUrl}</TableCell>
            <TableCell>{link.clicks}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 通知/提示

```typescript
// ✅ 使用 shadcn/ui Toast
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function ActionButton() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: '成功！',
      description: '連結已建立',
    });
  };

  return <Button onClick={handleClick}>建立連結</Button>;
}
```

### 載入狀態

```typescript
// ✅ 使用 shadcn/ui Skeleton
import { Skeleton } from '@/components/ui/skeleton';

export function LinkCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

## 🎯 常用元件清單

### 必備元件

安裝專案中最常用的元件：

```bash
# 基礎元件
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card

# 表單相關
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group

# 反饋元件
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add skeleton

# 對話框
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add popover

# 資料展示
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add separator

# 導航
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

## 🎨 樣式自訂

### 使用 Tailwind 進行客製化

```typescript
// ✅ 通過 className 自訂 shadcn/ui 元件
import { Button } from '@/components/ui/button';

export function CustomStyledButton() {
  return (
    <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
      漸層按鈕
    </Button>
  );
}
```

### 使用 CVA 建立變體

如果需要建立組合元件，使用 CVA (Class Variance Authority)：

```typescript
// ✅ 在 shadcn/ui 基礎上建立組合元件
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LinkCardProps {
  title: string;
  url: string;
  onDelete: () => void;
}

export function LinkCard({ title, url, onDelete }: LinkCardProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{url}</p>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        刪除
      </Button>
    </Card>
  );
}
```

## 🚫 禁止事項

### ❌ 不要建立自定義基礎元件

```typescript
// ❌ 錯誤：建立自定義按鈕
export function MyButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md bg-primary px-4 py-2 text-white">
      {children}
    </button>
  );
}

// ✅ 正確：使用 shadcn/ui Button
import { Button } from '@/components/ui/button';
export function MyComponent() {
  return <Button>點擊我</Button>;
}
```

### ❌ 不要使用其他 UI 庫

```typescript
// ❌ 錯誤：使用其他 UI 庫
import { Button } from "@mui/material";
import { Button } from "antd";
import { Button } from "react-bootstrap";

// ✅ 正確：只使用 shadcn/ui
import { Button } from "@/components/ui/button";
```

### ❌ 不要直接修改 components/ui 中的檔案

```typescript
// ❌ 錯誤：直接修改 components/ui/button.tsx
// 如果元件樣式不符需求，應該：
// 1. 使用 className 覆蓋樣式
// 2. 建立組合元件
// 3. 更新 Tailwind 配置

// ✅ 正確：建立包裝元件
import { Button } from '@/components/ui/button';

export function PrimaryButton({ children, ...props }) {
  return (
    <Button className="custom-styles" {...props}>
      {children}
    </Button>
  );
}
```

## 🔧 配置文件

### components.json

確保 `components.json` 配置正確：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 主題自訂

在 `app/globals.css` 中自訂主題顏色：

```css
/* ✅ 自訂 shadcn/ui 主題變數 */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* 更多顏色變數... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* 深色模式顏色... */
  }
}
```

## 📦 組合元件模式

當需要建立業務特定的元件時，組合 shadcn/ui 元件：

```typescript
// ✅ 正確：組合 shadcn/ui 元件建立業務元件
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LinkStatsCardProps {
  shortCode: string;
  clicks: number;
  createdAt: Date;
}

export function LinkStatsCard({ shortCode, clicks, createdAt }: LinkStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{shortCode}</span>
          <Badge>{clicks} 次點擊</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          建立於 {createdAt.toLocaleDateString()}
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm">編輯</Button>
          <Button variant="destructive" size="sm">刪除</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🎯 可訪問性（Accessibility）

shadcn/ui 元件已內建可訪問性支援，確保：

```typescript
// ✅ 使用語義化的元件結構
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function AccessibleForm() {
  return (
    <div className="space-y-2">
      {/* Label 會自動關聯到 Input */}
      <Label htmlFor="email">電子郵件</Label>
      <Input
        id="email"
        type="email"
        aria-describedby="email-description"
      />
      <p id="email-description" className="text-sm text-muted-foreground">
        我們不會分享你的電子郵件
      </p>
    </div>
  );
}
```

## 🔍 常見場景檢查清單

建立 UI 時，確保：

- [ ] 使用 shadcn/ui 元件，不建立自定義基礎元件
- [ ] 透過 `npx shadcn@latest add [component]` 安裝元件
- [ ] 使用 Tailwind classes 進行樣式客製化
- [ ] 組合 shadcn/ui 元件建立業務邏輯元件
- [ ] 不直接修改 `components/ui/` 中的檔案
- [ ] 不使用其他 UI 庫（MUI、Ant Design 等）
- [ ] 保持元件的可訪問性
- [ ] 使用 TypeScript 定義 props 類型

## 📚 相關文件

- [shadcn/ui 官方文件](https://ui.shadcn.com)
- [React 模式](./REACT_PATTERNS.md) - 元件結構
- [TypeScript 標準](./TYPESCRIPT_STANDARDS.md) - 類型定義

---

**更新日期**：2026-01-18
**狀態**：活躍
**負責人**：Belli Wu

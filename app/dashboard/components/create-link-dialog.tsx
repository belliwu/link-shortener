"use client";

import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createLink } from "../actions";

/**
 * Form schema for create link dialog
 */
const formSchema = z.object({
  url: z.string().url({ message: "請輸入有效的 URL" }),
  customCode: z
    .string()
    .min(3, "自訂短碼至少需要 3 個字元")
    .max(20, "自訂短碼最多 20 個字元")
    .regex(/^[a-zA-Z0-9_-]+$/, "自訂短碼只能包含英文字母、數字、底線和連字號")
    .optional()
    .or(z.literal("")),
});

/**
 * CreateLinkDialog 元件
 * 提供建立新縮短連結的對話框
 */
export function CreateLinkDialog(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      customCode: "",
    },
  });

  /**
   * 處理表單提交
   */
  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    setIsSubmitting(true);
    setError(null);

    const result = await createLink({
      url: values.url,
      customCode: values.customCode,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "發生未知錯誤");
      return;
    }

    // 成功：關閉對話框並重置表單
    setOpen(false);
    form.reset();
  }

  /**
   * 處理對話框開啟/關閉狀態變更
   */
  function handleOpenChange(newOpen: boolean): void {
    setOpen(newOpen);
    if (!newOpen) {
      // 關閉時重置表單和錯誤狀態
      form.reset();
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          建立連結
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>建立新的短連結</DialogTitle>
          <DialogDescription>
            輸入你想要縮短的 URL，可選擇自訂短碼
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>原始 URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    請輸入完整的 URL（含 https://）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自訂短碼（選填）</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="my-custom-code"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    留空則自動生成。只能包含英文字母、數字、底線和連字號
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "建立中..." : "建立連結"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

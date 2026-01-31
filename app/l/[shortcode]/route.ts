import { NextRequest, NextResponse } from "next/server";

import { getLinkByShortCode } from "@/data/links";

/**
 * 處理短網址重定向
 * 根據提供的短碼查找原始 URL 並重定向
 * @param request - Next.js 請求物件
 * @param params - 路由參數，包含 shortcode
 * @returns 重定向回應或錯誤回應
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> },
) {
  try {
    const { shortcode } = await params;

    // 驗證短碼參數
    if (!shortcode || typeof shortcode !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid shortcode" },
        { status: 400 },
      );
    }

    // 從資料庫查詢連結
    const link = await getLinkByShortCode(shortcode);

    // 如果找不到連結，返回 404
    if (!link) {
      return NextResponse.json(
        { success: false, error: "Link not found" },
        { status: 404 },
      );
    }

    // 重定向到原始 URL
    return NextResponse.redirect(link.originalUrl, { status: 307 });
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing the redirect",
      },
      { status: 500 },
    );
  }
}

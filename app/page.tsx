import { JSX } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Zap, BarChart3, Shield, Globe, Users } from "lucide-react";

/**
 * Home page component that displays a landing page for Link Shortener
 * Redirects authenticated users to dashboard
 * @returns Landing page JSX for unauthenticated users
 */
export default async function Home(): Promise<JSX.Element> {
  const { userId } = await auth();

  // 已登入的用戶應該在 dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
        <Badge className="mb-4" variant="secondary">
          ✨ 全新推出
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          簡化您的連結，
          <br />
          <span className="text-primary">放大您的影響力</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Link Shortener 讓您輕鬆建立、管理和追蹤短連結。
          <br />
          專為現代網路設計的強大工具。
        </p>
        <SignUpButton mode="modal">
          <Button size="lg" className="text-lg">
            <Zap className="mr-2 size-5" />
            免費開始使用
          </Button>
        </SignUpButton>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            為什麼選擇 Link Shortener？
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            我們提供完整的連結管理解決方案，讓您的網路行銷更有效率
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="size-6 text-primary" />
              </div>
              <CardTitle>快速縮短連結</CardTitle>
              <CardDescription>
                只需幾秒鐘，即可將冗長的 URL 轉換為簡潔易記的短連結
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="size-6 text-primary" />
              </div>
              <CardTitle>詳細分析</CardTitle>
              <CardDescription>
                追蹤每個連結的點擊次數、來源和訪客資訊，掌握完整數據
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-6 text-primary" />
              </div>
              <CardTitle>閃電般速度</CardTitle>
              <CardDescription>
                採用最新技術架構，確保您的短連結載入速度快如閃電
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-6 text-primary" />
              </div>
              <CardTitle>安全可靠</CardTitle>
              <CardDescription>
                企業級安全保護，確保您的連結和數據絕對安全無虞
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 5 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="size-6 text-primary" />
              </div>
              <CardTitle>自訂短碼</CardTitle>
              <CardDescription>
                建立專屬的品牌短連結，讓您的連結更具識別度和專業感
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 6 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <CardTitle>團隊協作</CardTitle>
              <CardDescription>
                與團隊成員共同管理連結，提升工作效率和協作能力
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              準備好開始了嗎？
            </h2>
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
              加入數千位使用者的行列，立即體驗 Link Shortener 的強大功能
            </p>
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg">
                <Zap className="mr-2 size-5" />
                立即免費註冊
              </Button>
            </SignUpButton>
            <p className="mt-4 text-sm text-muted-foreground">
              無需信用卡 • 完全免費開始
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Link Shortener. 版權所有。</p>
        </div>
      </footer>
    </div>
  );
}

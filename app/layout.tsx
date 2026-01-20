import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Link Shortener",
  description: "Create and manage short links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{ baseTheme: shadcn }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-between items-center p-4 gap-4 h-16 bg-card border-b border-border">
            <div>
              <h1 className="text-2xl font-bold">Link Shortener</h1>
            </div>
            <div className="flex items-center justify-between p-4 gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    className="bg-[#6c47ff] text-white rounded-full font-medium hover:bg-[#5739cc]"
                    size="default"
                  >
                    簽到
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    className="bg-[#6c47ff] text-white rounded-full font-medium hover:bg-[#5739cc]"
                    size="default"
                  >
                    註冊
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

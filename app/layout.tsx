import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "世界杯每日量化分析看板",
  description: "中文世界杯每日量化分析产品"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <footer className="border-t border-outline-variant bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-display text-lg font-bold">世界杯每日量化分析看板</div>
              <p className="text-sm text-secondary">规则模型驱动，AI 仅负责中文解释。</p>
            </div>
            <div className="flex gap-5 text-sm text-secondary">
              <span>数据协议</span>
              <span>服务条款</span>
              <span>联系支持</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

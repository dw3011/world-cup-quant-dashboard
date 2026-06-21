"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, ClipboardEdit, PlusCircle, Search, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/", label: "今日分析", icon: CalendarDays },
  { href: "/daily-input", label: "今日录入", icon: ClipboardEdit },
  { href: "/matches/manage", label: "赛程维护", icon: PlusCircle },
  { href: "/stats", label: "模型统计", icon: BarChart3 },
  { href: "/settings", label: "模型设置", icon: Settings }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck size={19} />
          </span>
          <span className="hidden font-display text-lg font-bold text-primary sm:inline">世界杯每日量化分析看板</span>
          <span className="font-display text-lg font-bold text-primary sm:hidden">WC 分析</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-primary/10 text-primary" : "text-secondary hover:bg-surface-low hover:text-primary"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 rounded-lg border border-outline-variant bg-surface-low px-3 py-2 lg:flex">
          <Search size={16} className="text-outline" />
          <input className="w-44 bg-transparent text-sm outline-none" placeholder="搜索赛事或球队..." />
        </div>
      </div>
      <nav className="flex border-t border-outline-variant bg-white px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold ${
                active ? "bg-primary/10 text-primary" : "text-secondary"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

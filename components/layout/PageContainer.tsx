export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>;
}

import type { AIReport as AIReportType } from "@/types/prediction";

export function AIReport({ report }: { report: AIReportType }) {
  const final = report.sections.find((section) => section.title === "最终建议");
  const risk = report.sections.find((section) => section.title === "风险提示");
  const regular = report.sections.filter((section) => section.title !== "最终建议" && section.title !== "风险提示");

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">AI 中文分析报告</h2>
        <p className="mt-1 text-sm text-secondary">AI 只根据规则模型结果生成中文解释，不参与概率计算。</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {regular.map((section) => (
          <section key={section.title} className={section.title === "比赛背景" || section.title === "模型预测结果" ? "md:col-span-2" : ""}>
            <h3 className="border-l-4 border-primary pl-3 font-display text-lg font-bold text-primary">{section.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{section.content}</p>
          </section>
        ))}
      </div>
      <div className="grid gap-4 border-t border-outline-variant pt-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-display text-xl font-bold text-primary">{final?.title}</h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">{final?.content}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-5">
          <h3 className="label-caps text-danger">{risk?.title}</h3>
          <p className="mt-2 text-sm leading-6 text-red-900">{risk?.content}</p>
        </div>
      </div>
    </div>
  );
}

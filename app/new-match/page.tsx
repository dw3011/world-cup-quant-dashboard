import { PageContainer } from "@/components/layout/PageContainer";

const baseFields = ["比赛日期", "比赛时间", "小组", "主队", "主队国旗", "客队", "客队国旗", "比赛状态"];
const oddsFields = ["主胜赔率", "平局赔率", "客胜赔率", "大小球赔率（可选）", "让球盘口（可选）"];
const ratingFields = ["主队硬实力评分 1-10", "客队硬实力评分 1-10", "主队近期状态评分 1-10", "客队近期状态评分 1-10", "主队攻防倾向评分 1-10", "客队攻防倾向评分 1-10"];

export default function NewMatchPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary">新增比赛</span>
        <h1 className="mt-2 font-display text-3xl font-bold">录入比赛数据</h1>
        <p className="mt-2 text-secondary">请手动输入比赛基础、市场赔率及战力评分，系统将结合规则模型与 AI 生成多维分析报告。</p>
      </div>
      <form className="space-y-6">
        <Section title="基础信息">
          {baseFields.map((field) => <Field key={field} label={field} />)}
        </Section>
        <Section title="赔率信息">
          {oddsFields.map((field) => <Field key={field} label={field} />)}
        </Section>
        <Section title="球队评分">
          {ratingFields.map((field) => <Field key={field} label={field} type="number" />)}
        </Section>
        <section className="card">
          <h2 className="mb-4 font-display text-xl font-bold">补充信息</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {["伤停信息", "战意与小组形势", "阵容轮换", "市场 / 盘口备注", "人工备注"].map((field) => (
              <label key={field} className="space-y-2 md:last:col-span-2">
                <span className="label-caps">{field}</span>
                <textarea className="input min-h-28" placeholder={`请输入${field}`} />
              </label>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary">保存草稿</button>
          <button type="button" className="btn-secondary">运行规则模型</button>
          <button type="button" className="btn-primary">生成 AI 分析</button>
        </div>
      </form>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="space-y-2">
      <span className="label-caps">{label}</span>
      <input className="input" type={type} placeholder={label} min={type === "number" ? 1 : undefined} max={type === "number" ? 10 : undefined} />
    </label>
  );
}

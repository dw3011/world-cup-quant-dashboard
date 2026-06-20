import { PageContainer } from "@/components/layout/PageContainer";
import { MODEL_WEIGHTS } from "@/lib/models/rating";

export default function SettingsPage() {
  const total = MODEL_WEIGHTS.reduce((sum, item) => sum + item.value, 0);

  return (
    <PageContainer>
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary">模型设置</span>
        <h1 className="mt-2 font-display text-3xl font-bold">模型核心权重调节</h1>
        <p className="mt-2 text-secondary">第一版仅提供 UI 预留，最终胜平负概率会归一化为 100%。</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <div className="card">
            <h2 className="font-display text-xl font-bold">当前模型状态</h2>
            <p className="mt-3 text-sm leading-6 text-secondary">当前使用“平衡博弈”预设，适用于大部分常规小组赛和淘汰赛阶段分析。</p>
            <div className="mt-5 rounded-xl bg-primary/10 p-4 text-primary">
              <div className="text-sm font-semibold">权重总和</div>
              <div className="mt-1 font-display text-3xl font-bold">{total}%</div>
            </div>
          </div>
          <div className="card">
            <h2 className="mb-3 font-display text-xl font-bold">权重预设方案</h2>
            {["平衡博弈", "市场优先", "状态优先"].map((item, index) => (
              <div key={item} className={`mb-3 rounded-xl border p-4 ${index === 0 ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-low"}`}>
                <div className="font-semibold">{item}</div>
                <p className="mt-1 text-sm text-secondary">{index === 0 ? "综合赔率、实力与临场信息" : index === 1 ? "强化市场异常波动" : "强化近期状态与阵容完整度"}</p>
              </div>
            ))}
          </div>
        </aside>
        <section className="card lg:col-span-8">
          <h2 className="mb-5 font-display text-2xl font-bold">权重配置</h2>
          <div className="space-y-5">
            {MODEL_WEIGHTS.map((item) => (
              <label key={item.key} className="block">
                <div className="mb-2 flex justify-between">
                  <span className="font-semibold">{item.label}</span>
                  <span className="font-mono font-bold text-primary">{item.value}%</span>
                </div>
                <input className="w-full accent-primary" type="range" min={0} max={100} defaultValue={item.value} />
              </label>
            ))}
          </div>
          <div className={`mt-6 rounded-xl p-4 text-sm ${total === 100 ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"}`}>
            权重总和必须为 100%。当前总和：{total}%。最终胜平负概率会归一化为 100%。
          </div>
          <div className="mt-6 flex gap-3">
            <button className="btn-secondary">恢复默认</button>
            <button className="btn-primary">保存设置</button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

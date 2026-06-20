import { PageContainer } from "@/components/layout/PageContainer";
import { NewMatchForm } from "@/components/match/NewMatchForm";

export default function NewMatchPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary">新增比赛</span>
        <h1 className="mt-2 font-display text-3xl font-bold">录入比赛数据</h1>
        <p className="mt-2 text-secondary">请手动输入比赛基础、市场赔率及战力评分，系统将结合规则模型与 AI 生成多维分析报告。</p>
      </div>
      <NewMatchForm />
    </PageContainer>
  );
}

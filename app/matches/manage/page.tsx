import { PageContainer } from "@/components/layout/PageContainer";
import { BulkScheduleImport } from "@/components/match/BulkScheduleImport";
import { NewMatchForm } from "@/components/match/NewMatchForm";

export default function MatchManagePage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary">赛程维护</span>
        <h1 className="mt-2 font-display text-3xl font-bold">维护世界杯赛程</h1>
        <p className="mt-2 text-secondary">用于提前补充 matches 表中的比赛日期、时间、球队、国旗和阶段信息；不作为每日核心入口。</p>
      </div>
      <div className="mb-6">
        <BulkScheduleImport />
      </div>
      <NewMatchForm />
    </PageContainer>
  );
}

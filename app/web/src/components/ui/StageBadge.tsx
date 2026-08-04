import Badge from "@/components/ui/Badge";
import { getStageLabel, type ApplicationStage } from "@/lib/mock-data";

interface StageBadgeProps {
  stage: ApplicationStage;
  size?: "sm" | "md";
  className?: string;
}

const stageVariantMap: Record<ApplicationStage, "default" | "success" | "warning" | "danger" | "info"> = {
  pending_review: "warning",
  applied: "default",
  shortlisted: "info",
  "round-1": "info",
  "round-2": "info",
  "round-3": "info",
  offered: "success",
  rejected: "danger",
};

export default function StageBadge({ stage, size = "md", className = "" }: StageBadgeProps) {
  return (
    <Badge variant={stageVariantMap[stage] || "default"} size={size} dot className={className}>
      {getStageLabel(stage)}
    </Badge>
  );
}

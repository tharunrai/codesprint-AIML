import React from "react";
import Card from "@/components/ui/Card";

interface ProfileSectionProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileSection({ title, icon, action, children, className = "" }: ProfileSectionProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </Card>
  );
}

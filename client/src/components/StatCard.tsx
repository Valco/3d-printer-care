import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "default" | "overdue" | "warning" | "success";
  testId?: string;
};

const variantStyles = {
  default: "text-primary",
  overdue: "text-overdue",
  warning: "text-warning",
  success: "text-success",
};

export default function StatCard({ title, value, icon: Icon, variant, testId }: StatCardProps) {
  return (
    <Card className="p-4" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${variantStyles[variant]}`} data-testid={`${testId}-value`}>
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 opacity-30 ${variantStyles[variant]}`} />
      </div>
    </Card>
  );
}

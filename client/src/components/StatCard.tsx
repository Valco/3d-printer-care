import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type TaskWithPrinter = {
  id: string;
  taskTitle: string;
  nextDue: string | null;
  printerName: string;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "default" | "overdue" | "warning" | "success";
  testId?: string;
  tasks?: TaskWithPrinter[];
};

const variantStyles = {
  default: "text-primary",
  overdue: "text-overdue",
  warning: "text-warning",
  success: "text-success",
};

export default function StatCard({ title, value, icon: Icon, variant, testId, tasks }: StatCardProps) {
  const hasTasksToShow = tasks && tasks.length > 0;

  return (
    <Card className="p-4" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${variantStyles[variant]}`} data-testid={`${testId}-value`}>
            {value}
          </p>
        </div>
        {hasTasksToShow ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div 
                className={`h-8 w-8 opacity-30 hover:opacity-60 transition-opacity cursor-help ${variantStyles[variant]}`}
                data-testid={`${testId}-icon-trigger`}
              >
                <Icon className="h-8 w-8" />
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" data-testid={`${testId}-hover-card`}>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{title}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="text-sm border-l-2 pl-2 py-1"
                      style={{ borderColor: `var(--${variant})` }}
                      data-testid={`task-item-${task.id}`}
                    >
                      <div className="font-medium">{task.taskTitle}</div>
                      <div className="text-muted-foreground text-xs">{task.printerName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Icon className={`h-8 w-8 opacity-30 ${variantStyles[variant]}`} />
        )}
      </div>
    </Card>
  );
}

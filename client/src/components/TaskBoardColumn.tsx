import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  title: string;
  printerName: string;
  priority: number;
  dueDate?: string;
};

type TaskBoardColumnProps = {
  title: string;
  count: number;
  tasks: Task[];
  variant: "overdue" | "today" | "week" | "upcoming";
  onTaskClick: (taskId: string) => void;
};

const variantStyles = {
  overdue: {
    badge: "bg-overdue/20 text-overdue border-overdue/30",
    headerBg: "bg-overdue/10",
  },
  today: {
    badge: "bg-warning/20 text-warning border-warning/30",
    headerBg: "bg-warning/10",
  },
  week: {
    badge: "bg-info/20 text-info border-info/30",
    headerBg: "bg-info/10",
  },
  upcoming: {
    badge: "bg-success/20 text-success border-success/30",
    headerBg: "bg-success/10",
  },
};

export default function TaskBoardColumn({ title, count, tasks, variant, onTaskClick }: TaskBoardColumnProps) {
  const styles = variantStyles[variant];

  return (
    <div className="flex flex-col h-full min-w-[280px]" data-testid={`column-${variant}`}>
      <div className={`p-4 rounded-t-lg ${styles.headerBg}`}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline" className={styles.badge} data-testid={`badge-count-${variant}`}>
            {count}
          </Badge>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-2 bg-muted/20 rounded-b-lg overflow-y-auto min-h-[200px]">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="p-3 hover-elevate cursor-pointer"
            onClick={() => onTaskClick(task.id)}
            data-testid={`task-card-${task.id}`}
          >
            <h4 className="font-medium text-sm mb-1">{task.title}</h4>
            <p className="text-xs text-muted-foreground mb-2">{task.printerName}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-sm ${
                      i < task.priority ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              )}
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Немає завдань
          </div>
        )}
      </div>
    </div>
  );
}

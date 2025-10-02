import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Lock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

type TaskItem = {
  id: string;
  taskTitle: string;
  nextDue: string | null;
};

type PrinterCardProps = {
  id: string;
  name: string;
  model?: string;
  location?: string;
  visibility: "PUBLIC" | "RESTRICTED";
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  overdueTasks: TaskItem[];
  todayTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  onViewDetails: (id: string) => void;
};

export default function PrinterCard({
  id,
  name,
  model,
  location,
  visibility,
  overdueCount,
  todayCount,
  upcomingCount,
  overdueTasks,
  todayTasks,
  upcomingTasks,
  onViewDetails,
}: PrinterCardProps) {
  const hasOverdue = overdueCount > 0;
  
  const allTasks = [
    ...upcomingTasks.map(t => ({ ...t, status: 'upcoming' as const })),
    ...todayTasks.map(t => ({ ...t, status: 'today' as const })),
    ...overdueTasks.map(t => ({ ...t, status: 'overdue' as const })),
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: uk });
    } catch {
      return '—';
    }
  };

  return (
    <Card
      className={`hover-elevate ${hasOverdue ? "border-2 border-overdue" : ""}`}
      data-testid={`card-printer-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-printer-name-${id}`}>
              {name}
            </h3>
            {model && (
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-printer-model-${id}`}>
                {model}
              </p>
            )}
          </div>
          {visibility === "RESTRICTED" && (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" data-testid={`icon-restricted-${id}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate" data-testid={`text-printer-location-${id}`}>{location}</span>
          </div>
        )}
        <div className="flex flex-col items-start gap-1" data-testid={`tasks-container-${id}`}>
          {allTasks.map((task) => {
            const colorClasses = {
              upcoming: 'bg-success/80 border-success',
              today: 'bg-warning/80 border-warning',
              overdue: 'bg-overdue/80 border-overdue',
            };
            
            return (
              <Tooltip key={task.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={`w-10 h-5 rounded-full border-2 ${colorClasses[task.status]} cursor-help transition-transform hover:scale-110`}
                    data-testid={`task-cell-${task.id}`}
                    aria-label={task.taskTitle}
                  />
                </TooltipTrigger>
                <TooltipContent data-testid={`tooltip-${task.id}`}>
                  <div className="space-y-1">
                    <p className="font-semibold">{task.taskTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Термін: {formatDate(task.nextDue)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onViewDetails(id)}
          data-testid={`button-view-details-${id}`}
        >
          Переглянути деталі
        </Button>
      </CardFooter>
    </Card>
  );
}

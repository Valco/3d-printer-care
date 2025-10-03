import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import TaskBoardColumn from "@/components/TaskBoardColumn";
import { Skeleton } from "@/components/ui/skeleton";

type TaskItem = {
  id: string;
  title: string;
  printerName: string;
  priority: number;
  dueDate?: string;
};

type BoardData = {
  overdue: TaskItem[];
  today: TaskItem[];
  week: TaskItem[];
  upcoming: TaskItem[];
};

export default function TaskBoard() {
  const { t } = useTranslation();
  const { data: boardData, isLoading } = useQuery<BoardData>({
    queryKey: ["/api/board"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard.taskBoard')}</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        <TaskBoardColumn
          title={t('status.overdue')}
          count={boardData?.overdue.length || 0}
          tasks={boardData?.overdue || []}
          variant="overdue"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title={t('status.today')}
          count={boardData?.today.length || 0}
          tasks={boardData?.today || []}
          variant="today"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title={t('status.week')}
          count={boardData?.week.length || 0}
          tasks={boardData?.week || []}
          variant="week"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title={t('status.upcoming')}
          count={boardData?.upcoming.length || 0}
          tasks={boardData?.upcoming || []}
          variant="upcoming"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
      </div>
    </div>
  );
}

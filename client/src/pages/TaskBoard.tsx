import TaskBoardColumn from "@/components/TaskBoardColumn";

export default function TaskBoard() {
  //todo: remove mock functionality
  const mockTasks = {
    overdue: [
      { id: "1", title: "Калібрування столу", printerName: "X1C-002", priority: 9, dueDate: "2 days ago" },
      { id: "2", title: "Очищення екструдера", printerName: "A1-001", priority: 8, dueDate: "1 day ago" },
      { id: "3", title: "Заміна сопла", printerName: "Prusa MK4", priority: 7, dueDate: "3 days ago" },
    ],
    today: [
      { id: "4", title: "Змащування осей", printerName: "X1C-002", priority: 6, dueDate: "Today" },
      { id: "5", title: "Перевірка ременів", printerName: "A1-001", priority: 5, dueDate: "Today" },
      { id: "6", title: "Очищення столу", printerName: "Prusa MK4", priority: 4, dueDate: "Today" },
      { id: "7", title: "Загальний огляд", printerName: "X1C-002", priority: 10, dueDate: "Today" },
    ],
    week: [
      { id: "8", title: "Калібрування потоку", printerName: "A1-001", priority: 3 },
      { id: "9", title: "Заміна фільтра", printerName: "Prusa MK4", priority: 2 },
    ],
    upcoming: [
      { id: "10", title: "Змащування осей", printerName: "A1-001", priority: 6 },
      { id: "11", title: "Перевірка ременів", printerName: "X1C-002", priority: 5 },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Task Board</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        <TaskBoardColumn
          title="Overdue"
          count={mockTasks.overdue.length}
          tasks={mockTasks.overdue}
          variant="overdue"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title="Today"
          count={mockTasks.today.length}
          tasks={mockTasks.today}
          variant="today"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title="This Week"
          count={mockTasks.week.length}
          tasks={mockTasks.week}
          variant="week"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
        <TaskBoardColumn
          title="Upcoming"
          count={mockTasks.upcoming.length}
          tasks={mockTasks.upcoming}
          variant="upcoming"
          onTaskClick={(id) => console.log("Task clicked:", id)}
        />
      </div>
    </div>
  );
}

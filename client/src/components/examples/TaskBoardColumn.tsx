import TaskBoardColumn from "../TaskBoardColumn";

const mockTasks = {
  overdue: [
    { id: "1", title: "Калібрування столу", printerName: "X1C-002", priority: 9, dueDate: "2 days ago" },
    { id: "2", title: "Очищення екструдера", printerName: "A1-001", priority: 8, dueDate: "1 day ago" },
  ],
  today: [
    { id: "3", title: "Змащування осей", printerName: "X1C-002", priority: 6, dueDate: "Today" },
    { id: "4", title: "Перевірка ременів", printerName: "Prusa MK4", priority: 5, dueDate: "Today" },
  ],
  week: [
    { id: "5", title: "Очищення столу", printerName: "A1-001", priority: 4 },
    { id: "6", title: "Калібрування потоку", printerName: "X1C-002", priority: 3 },
  ],
  upcoming: [
    { id: "7", title: "Заміна фільтра", printerName: "Prusa MK4", priority: 2 },
  ],
};

export default function TaskBoardColumnExample() {
  return (
    <div className="p-4 flex gap-4 overflow-x-auto">
      <TaskBoardColumn
        title="Overdue"
        count={2}
        tasks={mockTasks.overdue}
        variant="overdue"
        onTaskClick={(id) => console.log("Task clicked:", id)}
      />
      <TaskBoardColumn
        title="Today"
        count={2}
        tasks={mockTasks.today}
        variant="today"
        onTaskClick={(id) => console.log("Task clicked:", id)}
      />
      <TaskBoardColumn
        title="This Week"
        count={2}
        tasks={mockTasks.week}
        variant="week"
        onTaskClick={(id) => console.log("Task clicked:", id)}
      />
      <TaskBoardColumn
        title="Upcoming"
        count={1}
        tasks={mockTasks.upcoming}
        variant="upcoming"
        onTaskClick={(id) => console.log("Task clicked:", id)}
      />
    </div>
  );
}

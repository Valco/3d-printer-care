import WorkLogForm from "../WorkLogForm";

const mockPrinters = [
  { id: "1", name: "X1C-002" },
  { id: "2", name: "A1-001" },
  { id: "3", name: "Prusa MK4" },
];

const mockTasks = [
  { id: "1", title: "Калібрування столу" },
  { id: "2", title: "Очищення екструдера" },
  { id: "3", title: "Змащування осей" },
];

export default function WorkLogFormExample() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <WorkLogForm
        printers={mockPrinters}
        tasks={mockTasks}
        onSubmit={(data) => console.log("Form submitted:", data)}
        onCancel={() => console.log("Form cancelled")}
      />
    </div>
  );
}

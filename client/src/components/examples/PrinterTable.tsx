import PrinterTable from "../PrinterTable";

const mockPrinters = [
  {
    id: "1",
    name: "X1C-002",
    model: "BambuLab X1C",
    location: "Lab Room 1",
    visibility: "PUBLIC" as const,
    printHours: 1250,
    jobsCount: 420,
    overdueCount: 2,
    todayCount: 1,
  },
  {
    id: "2",
    name: "A1-001",
    model: "BambuLab A1",
    location: "Lab Room 2",
    visibility: "RESTRICTED" as const,
    printHours: 850,
    jobsCount: 310,
    overdueCount: 0,
    todayCount: 3,
  },
  {
    id: "3",
    name: "Prusa MK4",
    model: "Prusa i3 MK4",
    location: "Workshop",
    visibility: "PUBLIC" as const,
    printHours: 560,
    jobsCount: 180,
    overdueCount: 1,
    todayCount: 0,
  },
];

export default function PrinterTableExample() {
  return (
    <div className="p-4">
      <PrinterTable
        printers={mockPrinters}
        userRole="ADMIN"
        onView={(id) => console.log("View:", id)}
        onEdit={(id) => console.log("Edit:", id)}
        onDelete={(id) => console.log("Delete:", id)}
      />
    </div>
  );
}

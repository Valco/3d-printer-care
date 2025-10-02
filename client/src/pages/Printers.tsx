import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PrinterTable from "@/components/PrinterTable";

export default function Printers() {
  const [userRole] = useState<"ADMIN" | "OPERATOR" | "VIEWER">("ADMIN");

  //todo: remove mock functionality
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

  const canAdd = userRole === "ADMIN" || userRole === "OPERATOR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Printers</h1>
        {canAdd && (
          <Button onClick={() => console.log("Add printer")} data-testid="button-add-printer">
            <Plus className="h-4 w-4 mr-2" />
            Add Printer
          </Button>
        )}
      </div>

      <PrinterTable
        printers={mockPrinters}
        userRole={userRole}
        onView={(id) => console.log("View:", id)}
        onEdit={(id) => console.log("Edit:", id)}
        onDelete={(id) => console.log("Delete:", id)}
      />
    </div>
  );
}

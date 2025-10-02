import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Printer } from "lucide-react";
import StatCard from "@/components/StatCard";
import PrinterCard from "@/components/PrinterCard";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkLogForm from "@/components/WorkLogForm";
import QRScanner from "@/components/QRScanner";

export default function Dashboard() {
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  //todo: remove mock functionality
  const mockPrinters = [
    {
      id: "1",
      name: "X1C-002",
      model: "BambuLab X1C",
      location: "Lab Room 1",
      visibility: "PUBLIC" as const,
      overdueCount: 2,
      todayCount: 1,
    },
    {
      id: "2",
      name: "A1-001",
      model: "BambuLab A1",
      location: "Lab Room 2",
      visibility: "RESTRICTED" as const,
      overdueCount: 0,
      todayCount: 3,
    },
    {
      id: "3",
      name: "Prusa MK4",
      model: "Prusa i3 MK4",
      location: "Workshop",
      visibility: "PUBLIC" as const,
      overdueCount: 1,
      todayCount: 0,
    },
  ];

  const mockFormData = {
    printers: mockPrinters.map(p => ({ id: p.id, name: p.name })),
    tasks: [
      { id: "1", title: "Калібрування столу" },
      { id: "2", title: "Очищення екструдера" },
      { id: "3", title: "Змащування осей" },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowWorkLog(true)} data-testid="button-record-work">
            <Plus className="h-4 w-4 mr-2" />
            Record Work
          </Button>
          <Button variant="outline" onClick={() => setShowScanner(true)} data-testid="button-scan-qr">
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Printers" value={3} icon={Printer} variant="default" testId="stat-total-printers" />
        <StatCard title="Overdue Tasks" value={3} icon={AlertCircle} variant="overdue" testId="stat-overdue" />
        <StatCard title="Today Tasks" value={4} icon={Clock} variant="warning" testId="stat-today" />
        <StatCard title="Upcoming Tasks" value={12} icon={TrendingUp} variant="success" testId="stat-upcoming" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Printers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPrinters.map((printer) => (
            <PrinterCard
              key={printer.id}
              {...printer}
              onViewDetails={(id) => console.log("View details:", id)}
            />
          ))}
        </div>
      </div>

      <Dialog open={showWorkLog} onOpenChange={setShowWorkLog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Work</DialogTitle>
          </DialogHeader>
          <WorkLogForm
            printers={mockFormData.printers}
            tasks={mockFormData.tasks}
            onSubmit={(data) => {
              console.log("Work logged:", data);
              setShowWorkLog(false);
            }}
            onCancel={() => setShowWorkLog(false)}
          />
        </DialogContent>
      </Dialog>

      {showScanner && (
        <QRScanner
          onScan={(data) => {
            console.log("Scanned:", data);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

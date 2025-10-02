import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Printer, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import PrinterCard from "@/components/PrinterCard";
import PrinterDetailsDialog from "@/components/PrinterDetailsDialog";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkLogForm from "@/components/WorkLogForm";
import QRScanner from "@/components/QRScanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type DashboardData = {
  totalPrinters: number;
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  printers: Array<{
    id: string;
    name: string;
    model: string | null;
    location: string | null;
    visibility: string;
    overdueCount: number;
    todayCount: number;
  }>;
};

type Printer = {
  id: string;
  name: string;
};

type TaskData = {
  id: string;
  title: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type WorkLogInput = {
  printerId: string;
  taskId?: string;
  axis?: string;
  nozzleSize?: string;
  printHours?: number;
  jobsCount?: number;
  details?: string;
  performedBy?: string;
};

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);
  const [preselectedPrinterId, setPreselectedPrinterId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Dashboard location changed:", location);
    const urlParts = location.split('?');
    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      const printerId = params.get('addWorkLog');
      console.log("Found addWorkLog param:", printerId);
      if (printerId) {
        setPreselectedPrinterId(printerId);
        setShowWorkLog(true);
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate]);

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: printers, isLoading: printersLoading } = useQuery<Printer[]>({
    queryKey: ["/api/printers"],
    select: (data: any[]) => data.map(p => ({ id: p.id, name: p.name })),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<TaskData[]>({
    queryKey: ["/api/tasks"],
  });

  const createWorkLog = useMutation({
    mutationFn: async (data: WorkLogInput) => {
      const res = await apiRequest("POST", "/api/worklogs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/board"] });
      toast({
        title: "Успіх",
        description: "Роботу успішно записано",
      });
      setShowWorkLog(false);
      setPreselectedPrinterId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Панель управління</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowWorkLog(true)} data-testid="button-record-work">
            <Plus className="h-4 w-4 mr-2" />
            Записати роботу
          </Button>
          <Button variant="outline" onClick={() => setShowScanner(true)} data-testid="button-scan-qr">
            <QrCode className="h-4 w-4 mr-2" />
            Сканувати QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Всього принтерів" 
          value={dashboardData?.totalPrinters || 0} 
          icon={Printer} 
          variant="default" 
          testId="stat-total-printers" 
        />
        <StatCard 
          title="Прострочені" 
          value={dashboardData?.overdueCount || 0} 
          icon={AlertCircle} 
          variant="overdue" 
          testId="stat-overdue" 
        />
        <StatCard 
          title="Сьогодні" 
          value={dashboardData?.todayCount || 0} 
          icon={Clock} 
          variant="warning" 
          testId="stat-today" 
        />
        <StatCard 
          title="Майбутні" 
          value={dashboardData?.upcomingCount || 0} 
          icon={TrendingUp} 
          variant="success" 
          testId="stat-upcoming" 
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Принтери</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData?.printers.map((printer) => (
            <PrinterCard
              key={printer.id}
              id={printer.id}
              name={printer.name}
              model={printer.model || undefined}
              location={printer.location || undefined}
              visibility={printer.visibility as "PUBLIC" | "RESTRICTED"}
              overdueCount={printer.overdueCount}
              todayCount={printer.todayCount}
              onViewDetails={(id) => setSelectedPrinterId(id)}
            />
          ))}
        </div>
      </div>

      <Dialog open={showWorkLog} onOpenChange={setShowWorkLog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Записати виконану роботу</DialogTitle>
          </DialogHeader>
          {printersLoading || tasksLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <WorkLogForm
              printers={printers || []}
              tasks={tasks || []}
              currentUserName={currentUser?.name || ""}
              preselectedPrinterId={preselectedPrinterId}
              onSubmit={(data) => createWorkLog.mutate(data)}
              onCancel={() => {
                setShowWorkLog(false);
                setPreselectedPrinterId(null);
              }}
            />
          )}
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

      <PrinterDetailsDialog
        printerId={selectedPrinterId}
        onClose={() => setSelectedPrinterId(null)}
      />
    </div>
  );
}

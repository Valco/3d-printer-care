import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Printer, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import PrinterCard from "@/components/PrinterCard";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkLogForm from "@/components/WorkLogForm";
import QRScanner from "@/components/QRScanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type DashboardData = {
  stats: {
    totalPrinters: number;
    overdueTasks: number;
    todayTasks: number;
    upcomingTasks: number;
  };
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

type TaskData = {
  id: string;
  title: string;
};

export default function Dashboard() {
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: printers } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/printers"],
    select: (data) => data.map(p => ({ id: p.id, name: p.name })),
  });

  const { data: tasks } = useQuery<TaskData[]>({
    queryKey: ["/api/tasks"],
  });

  const createWorkLog = useMutation({
    mutationFn: (data: any) => apiRequest("/api/worklogs", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/board"] });
      toast({
        title: "Success",
        description: "Work log recorded successfully",
      });
      setShowWorkLog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
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
        <StatCard 
          title="Total Printers" 
          value={dashboardData?.stats.totalPrinters || 0} 
          icon={Printer} 
          variant="default" 
          testId="stat-total-printers" 
        />
        <StatCard 
          title="Overdue Tasks" 
          value={dashboardData?.stats.overdueTasks || 0} 
          icon={AlertCircle} 
          variant="overdue" 
          testId="stat-overdue" 
        />
        <StatCard 
          title="Today Tasks" 
          value={dashboardData?.stats.todayTasks || 0} 
          icon={Clock} 
          variant="warning" 
          testId="stat-today" 
        />
        <StatCard 
          title="Upcoming Tasks" 
          value={dashboardData?.stats.upcomingTasks || 0} 
          icon={TrendingUp} 
          variant="success" 
          testId="stat-upcoming" 
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Printers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData?.printers.map((printer) => (
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
            printers={printers || []}
            tasks={tasks || []}
            onSubmit={(data) => createWorkLog.mutate(data)}
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

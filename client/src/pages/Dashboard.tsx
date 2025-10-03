import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Printer, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import PrinterCard from "@/components/PrinterCard";
import PrinterDetailsDialog from "@/components/PrinterDetailsDialog";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WorkLogForm from "@/components/WorkLogForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type TaskItem = {
  id: string;
  taskTitle: string;
  nextDue: string | null;
};

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
    upcomingCount: number;
    overdueTasks: TaskItem[];
    todayTasks: TaskItem[];
    upcomingTasks: TaskItem[];
  }>;
};

type Printer = {
  id: string;
  name: string;
};

type TaskData = {
  id: string;
  title: string;
  requiresAxis: boolean;
  requiresNozzleSize: boolean;
  requiresPlasticType: boolean;
  customFieldLabel: string | null;
  customFieldType: string | null;
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
  plasticType?: string;
  customFieldValue?: string;
  printHours?: number;
  jobsCount?: number;
  details?: string;
  performedBy?: string;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const [showWorkLog, setShowWorkLog] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);
  const [preselectedPrinterId, setPreselectedPrinterId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const printerId = params.get('addWorkLog');
    if (printerId) {
      setPreselectedPrinterId(printerId);
      setShowWorkLog(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

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
        title: t('common.success'),
        description: t('messages.saveSuccess'),
      });
      setShowWorkLog(false);
      setPreselectedPrinterId(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
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

  const allOverdueTasks = dashboardData?.printers.flatMap(p => 
    p.overdueTasks.map(t => ({ ...t, printerName: p.name }))
  ) || [];
  
  const allTodayTasks = dashboardData?.printers.flatMap(p => 
    p.todayTasks.map(t => ({ ...t, printerName: p.name }))
  ) || [];
  
  const allUpcomingTasks = dashboardData?.printers.flatMap(p => 
    p.upcomingTasks.map(t => ({ ...t, printerName: p.name }))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowWorkLog(true)} data-testid="button-record-work">
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.addWorkLog')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/scan')} data-testid="button-scan-qr">
            <QrCode className="h-4 w-4 mr-2" />
            {t('dashboard.scanQR')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('dashboard.totalPrinters')} 
          value={dashboardData?.totalPrinters || 0} 
          icon={Printer} 
          variant="default" 
          testId="stat-total-printers" 
        />
        <StatCard 
          title={t('dashboard.overdueTasks')} 
          value={dashboardData?.overdueCount || 0} 
          icon={AlertCircle} 
          variant="overdue" 
          testId="stat-overdue"
          tasks={allOverdueTasks}
        />
        <StatCard 
          title={t('dashboard.todayTasks')} 
          value={dashboardData?.todayCount || 0} 
          icon={Clock} 
          variant="warning" 
          testId="stat-today"
          tasks={allTodayTasks}
        />
        <StatCard 
          title={t('dashboard.upcomingTasks')} 
          value={dashboardData?.upcomingCount || 0} 
          icon={TrendingUp} 
          variant="success" 
          testId="stat-upcoming"
          tasks={allUpcomingTasks}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t('nav.printers')}</h2>
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
              upcomingCount={printer.upcomingCount}
              overdueTasks={printer.overdueTasks}
              todayTasks={printer.todayTasks}
              upcomingTasks={printer.upcomingTasks}
              onViewDetails={(id) => setSelectedPrinterId(id)}
            />
          ))}
        </div>
      </div>

      <Dialog open={showWorkLog} onOpenChange={setShowWorkLog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dashboard.addWorkLog')}</DialogTitle>
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

      <PrinterDetailsDialog
        printerId={selectedPrinterId}
        onClose={() => setSelectedPrinterId(null)}
      />
    </div>
  );
}

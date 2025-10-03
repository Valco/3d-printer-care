import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Lock, AlertCircle, Clock, Printer, Settings } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type PrinterDetails = {
  id: string;
  name: string;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  ipAddress: string | null;
  notes: string | null;
  visibility: string;
  printHours: number;
  jobsCount: number;
  overdueCount: number;
  todayCount: number;
  schedules: Array<{
    id: string;
    nextDue: string | null;
    isActive: boolean;
    lastCompleted: string | null;
    task: {
      id: string;
      title: string;
      priority: number;
      category: {
        id: string;
        name: string;
      } | null;
    };
  }>;
};

type QRCodeResponse = {
  qrCode: string;
};

type PrinterDetailsDialogProps = {
  printerId: string | null;
  onClose: () => void;
};

type Task = {
  id: string;
  title: string;
  priority: number;
  category: {
    id: string;
    name: string;
  } | null;
};

export default function PrinterDetailsDialog({ printerId, onClose }: PrinterDetailsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const { data: printer, isLoading: printerLoading } = useQuery<PrinterDetails>({
    queryKey: ["/api/printers", printerId],
    enabled: !!printerId,
  });

  const { data: qrData, isLoading: qrLoading } = useQuery<QRCodeResponse>({
    queryKey: ["/api/printers", printerId, "qr"],
    enabled: !!printerId,
  });

  const { data: allTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const addSchedule = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("POST", `/api/printers/${printerId}/schedules`, { taskId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/printers", printerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: t('common.success'),
        description: t('printer.taskAdded'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await apiRequest("DELETE", `/api/schedules/${scheduleId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/printers", printerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: t('common.success'),
        description: t('printer.taskRemoved'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (checked) {
      addSchedule.mutate(taskId);
    } else {
      const schedule = printer?.schedules.find(s => s.task.id === taskId);
      if (schedule) {
        removeSchedule.mutate(schedule.id);
      }
    }
  };

  const activeTasks = printer?.schedules.filter((s) => s.isActive) || [];
  const now = new Date();

  const getTaskStatus = (nextDue: string | null) => {
    if (!nextDue) return null;
    const dueDate = new Date(nextDue);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate < now) {
      return "overdue";
    } else if (dueDate >= today && dueDate < tomorrow) {
      return "today";
    }
    return "upcoming";
  };

  return (
    <Dialog open={!!printerId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-printer-details">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {printerLoading ? <Skeleton className="h-7 w-64" /> : `${t('printer.details')} ${printer?.name}`}
          </DialogTitle>
        </DialogHeader>

        {printerLoading ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : printer ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2" data-testid="text-basic-info">
                <Printer className="h-5 w-5" />
                {t('printer.basicInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-name">
                    {t('printer.name')}
                  </label>
                  <p className="text-base" data-testid="text-name">{printer.name}</p>
                </div>
                {printer.model && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-model">
                      {t('printer.model')}
                    </label>
                    <p className="text-base" data-testid="text-model">{printer.model}</p>
                  </div>
                )}
                {printer.serialNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-serial">
                      {t('printer.serialNumber')}
                    </label>
                    <p className="text-base font-mono" data-testid="text-serial">{printer.serialNumber}</p>
                  </div>
                )}
                {printer.location && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-location">
                      {t('printer.location')}
                    </label>
                    <p className="text-base flex items-center gap-2" data-testid="text-location">
                      <MapPin className="h-4 w-4" />
                      {printer.location}
                    </p>
                  </div>
                )}
                {printer.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-ip">
                      {t('printer.ipAddress')}
                    </label>
                    <p className="text-base font-mono" data-testid="text-ip">{printer.ipAddress}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-visibility">
                    {t('printer.visibility')}
                  </label>
                  <div className="flex items-center gap-2">
                    {printer.visibility === "RESTRICTED" && <Lock className="h-4 w-4" />}
                    <Badge
                      variant={printer.visibility === "RESTRICTED" ? "secondary" : "outline"}
                      data-testid="badge-visibility"
                    >
                      {printer.visibility === "RESTRICTED" ? t('printer.restricted') : t('printer.public')}
                    </Badge>
                  </div>
                </div>
              </div>
              {printer.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-notes">
                    {t('printer.notes')}
                  </label>
                  <p className="text-base text-muted-foreground" data-testid="text-notes">{printer.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-metrics">
                {t('printer.metrics')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-print-hours">
                    {t('printer.printHours')}
                  </label>
                  <p className="text-2xl font-bold" data-testid="text-print-hours">{printer.printHours}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-jobs-count">
                    {t('printer.jobsCount')}
                  </label>
                  <p className="text-2xl font-bold" data-testid="text-jobs-count">{printer.jobsCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-statistics">
                {t('printer.taskStats')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {printer.overdueCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-overdue/20 text-overdue border-overdue/30"
                    data-testid="badge-stat-overdue"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {printer.overdueCount} {t('status.overdue').toLowerCase()}
                  </Badge>
                )}
                {printer.todayCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-warning/20 text-warning border-warning/30"
                    data-testid="badge-stat-today"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {printer.todayCount} {t('status.today').toLowerCase()}
                  </Badge>
                )}
                {printer.overdueCount === 0 && printer.todayCount === 0 && (
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30" data-testid="badge-stat-ok">
                    {t('printer.allTasksComplete')}
                  </Badge>
                )}
              </div>
            </div>

            {qrData?.qrCode && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" data-testid="text-qr-code">
                  {t('printer.qrCode')}
                </h3>
                <div className="flex justify-center p-4 rounded-lg border bg-white">
                  <img src={qrData.qrCode} alt="QR код принтера" className="w-48 h-48" data-testid="img-qr-code" />
                </div>
              </div>
            )}

            {qrLoading && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('printer.qrCode')}</h3>
                <div className="flex justify-center">
                  <Skeleton className="w-48 h-48" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-active-tasks">
                {t('printer.activeTasks')} ({activeTasks.length})
              </h3>
              {activeTasks.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-task-title">{t('task.title')}</TableHead>
                        <TableHead data-testid="header-task-category">{t('task.category')}</TableHead>
                        <TableHead data-testid="header-task-priority">{t('task.priority')}</TableHead>
                        <TableHead data-testid="header-task-next-due">{t('dashboard.upcomingTasks')}</TableHead>
                        <TableHead data-testid="header-task-status">{t('status.active')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeTasks.map((schedule) => {
                        const status = getTaskStatus(schedule.nextDue);
                        return (
                          <TableRow key={schedule.id} data-testid={`row-task-${schedule.id}`}>
                            <TableCell className="font-medium" data-testid={`cell-task-title-${schedule.id}`}>
                              {schedule.task.title}
                            </TableCell>
                            <TableCell data-testid={`cell-task-category-${schedule.id}`}>
                              {schedule.task.category?.name || "—"}
                            </TableCell>
                            <TableCell data-testid={`cell-task-priority-${schedule.id}`}>
                              {schedule.task.priority}
                            </TableCell>
                            <TableCell data-testid={`cell-task-next-due-${schedule.id}`}>
                              {schedule.nextDue
                                ? format(new Date(schedule.nextDue), "dd MMM yyyy", { locale: uk })
                                : "—"}
                            </TableCell>
                            <TableCell data-testid={`cell-task-status-${schedule.id}`}>
                              {status === "overdue" && (
                                <Badge
                                  variant="outline"
                                  className="bg-overdue/20 text-overdue border-overdue/30"
                                  data-testid={`badge-task-overdue-${schedule.id}`}
                                >
                                  {t('status.overdue')}
                                </Badge>
                              )}
                              {status === "today" && (
                                <Badge
                                  variant="outline"
                                  className="bg-warning/20 text-warning border-warning/30"
                                  data-testid={`badge-task-today-${schedule.id}`}
                                >
                                  {t('status.today')}
                                </Badge>
                              )}
                              {status === "upcoming" && (
                                <Badge
                                  variant="outline"
                                  className="bg-success/20 text-success border-success/30"
                                  data-testid={`badge-task-upcoming-${schedule.id}`}
                                >
                                  {t('status.upcoming')}
                                </Badge>
                              )}
                              {!schedule.nextDue && (
                                <Badge variant="outline" data-testid={`badge-task-no-date-${schedule.id}`}>
                                  {t('printer.noDueDate')}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-tasks">
                  {t('printer.noActiveTasks')}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2" data-testid="text-task-settings">
                <Settings className="h-5 w-5" />
                {t('printer.taskSettings')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('printer.selectTasksInfo')}
              </p>
              {tasksLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : allTasks && allTasks.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12" data-testid="header-task-checkbox">{t('printer.active')}</TableHead>
                        <TableHead data-testid="header-task-name">{t('printer.taskName')}</TableHead>
                        <TableHead data-testid="header-task-cat">{t('task.category')}</TableHead>
                        <TableHead data-testid="header-task-prio">{t('task.priority')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allTasks.map((task) => {
                        const isAssigned = printer?.schedules.some(s => s.task.id === task.id) || false;
                        const isPending = addSchedule.isPending || removeSchedule.isPending;
                        
                        return (
                          <TableRow key={task.id} data-testid={`row-task-config-${task.id}`}>
                            <TableCell data-testid={`cell-task-checkbox-${task.id}`}>
                              <Checkbox
                                checked={isAssigned}
                                disabled={isPending}
                                onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                                data-testid={`checkbox-task-${task.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium" data-testid={`cell-task-name-${task.id}`}>
                              {task.title}
                            </TableCell>
                            <TableCell data-testid={`cell-task-cat-${task.id}`}>
                              {task.category?.name || "—"}
                            </TableCell>
                            <TableCell data-testid={`cell-task-prio-${task.id}`}>
                              {task.priority}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-all-tasks">
                  {t('printer.noAvailableTasks')}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Lock, AlertCircle, Clock, Printer } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

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

export default function PrinterDetailsDialog({ printerId, onClose }: PrinterDetailsDialogProps) {
  const { data: printer, isLoading: printerLoading } = useQuery<PrinterDetails>({
    queryKey: ["/api/printers", printerId],
    enabled: !!printerId,
  });

  const { data: qrData, isLoading: qrLoading } = useQuery<QRCodeResponse>({
    queryKey: ["/api/printers", printerId, "qr"],
    enabled: !!printerId,
  });

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
            {printerLoading ? <Skeleton className="h-7 w-64" /> : `Деталі принтера: ${printer?.name}`}
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
                Основна інформація
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-name">
                    Назва
                  </label>
                  <p className="text-base" data-testid="text-name">{printer.name}</p>
                </div>
                {printer.model && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-model">
                      Модель
                    </label>
                    <p className="text-base" data-testid="text-model">{printer.model}</p>
                  </div>
                )}
                {printer.serialNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-serial">
                      Серійний номер
                    </label>
                    <p className="text-base font-mono" data-testid="text-serial">{printer.serialNumber}</p>
                  </div>
                )}
                {printer.location && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground" data-testid="label-location">
                      Локація
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
                      IP адреса
                    </label>
                    <p className="text-base font-mono" data-testid="text-ip">{printer.ipAddress}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-visibility">
                    Видимість
                  </label>
                  <div className="flex items-center gap-2">
                    {printer.visibility === "RESTRICTED" && <Lock className="h-4 w-4" />}
                    <Badge
                      variant={printer.visibility === "RESTRICTED" ? "secondary" : "outline"}
                      data-testid="badge-visibility"
                    >
                      {printer.visibility === "RESTRICTED" ? "Обмежений" : "Публічний"}
                    </Badge>
                  </div>
                </div>
              </div>
              {printer.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-notes">
                    Примітки
                  </label>
                  <p className="text-base text-muted-foreground" data-testid="text-notes">{printer.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-metrics">
                Метрики
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-print-hours">
                    Годин друку
                  </label>
                  <p className="text-2xl font-bold" data-testid="text-print-hours">{printer.printHours}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <label className="text-sm font-medium text-muted-foreground" data-testid="label-jobs-count">
                    Кількість робіт
                  </label>
                  <p className="text-2xl font-bold" data-testid="text-jobs-count">{printer.jobsCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-statistics">
                Статистика завдань
              </h3>
              <div className="flex flex-wrap gap-2">
                {printer.overdueCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-overdue/20 text-overdue border-overdue/30"
                    data-testid="badge-stat-overdue"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {printer.overdueCount} прострочено
                  </Badge>
                )}
                {printer.todayCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-warning/20 text-warning border-warning/30"
                    data-testid="badge-stat-today"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {printer.todayCount} сьогодні
                  </Badge>
                )}
                {printer.overdueCount === 0 && printer.todayCount === 0 && (
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30" data-testid="badge-stat-ok">
                    Всі завдання виконані
                  </Badge>
                )}
              </div>
            </div>

            {qrData?.qrCode && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" data-testid="text-qr-code">
                  QR код
                </h3>
                <div className="flex justify-center p-4 rounded-lg border bg-white">
                  <img src={qrData.qrCode} alt="QR код принтера" className="w-48 h-48" data-testid="img-qr-code" />
                </div>
              </div>
            )}

            {qrLoading && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">QR код</h3>
                <div className="flex justify-center">
                  <Skeleton className="w-48 h-48" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold" data-testid="text-active-tasks">
                Активні завдання ({activeTasks.length})
              </h3>
              {activeTasks.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-task-title">Завдання</TableHead>
                        <TableHead data-testid="header-task-category">Категорія</TableHead>
                        <TableHead data-testid="header-task-priority">Пріоритет</TableHead>
                        <TableHead data-testid="header-task-next-due">Наступна дата</TableHead>
                        <TableHead data-testid="header-task-status">Статус</TableHead>
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
                                  Прострочено
                                </Badge>
                              )}
                              {status === "today" && (
                                <Badge
                                  variant="outline"
                                  className="bg-warning/20 text-warning border-warning/30"
                                  data-testid={`badge-task-today-${schedule.id}`}
                                >
                                  Сьогодні
                                </Badge>
                              )}
                              {status === "upcoming" && (
                                <Badge
                                  variant="outline"
                                  className="bg-success/20 text-success border-success/30"
                                  data-testid={`badge-task-upcoming-${schedule.id}`}
                                >
                                  Майбутнє
                                </Badge>
                              )}
                              {!schedule.nextDue && (
                                <Badge variant="outline" data-testid={`badge-task-no-date-${schedule.id}`}>
                                  Без дати
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
                  Немає активних завдань
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

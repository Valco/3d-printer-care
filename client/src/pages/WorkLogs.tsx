import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Filter, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WorkLog = {
  id: string;
  printerId: string;
  taskId: string | null;
  performedBy: string | null;
  date: string;
  details: string | null;
  axis: string | null;
  nozzleSize: string | null;
  plasticType: string | null;
  customFieldValue: string | null;
  printHoursAtLog: number | null;
  jobsCountAtLog: number | null;
  printer: {
    id: string;
    name: string;
    model: string | null;
  };
  task: {
    id: string;
    title: string;
    category: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type Printer = {
  id: string;
  name: string;
};

export default function WorkLogs() {
  const { t } = useTranslation();
  const [selectedPrinter, setSelectedPrinter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("30");

  const { data: workLogs, isLoading } = useQuery<WorkLog[]>({
    queryKey: ["/api/worklogs"],
  });

  const { data: printers } = useQuery<Printer[]>({
    queryKey: ["/api/printers"],
    select: (data: any[]) => data.map((p) => ({ id: p.id, name: p.name })),
  });

  const filteredLogs = workLogs?.filter((log) => {
    if (selectedPrinter !== "all" && log.printerId !== selectedPrinter) {
      return false;
    }

    if (dateFilter !== "all") {
      const logDate = new Date(log.date);
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
      if (logDate < daysAgo) {
        return false;
      }
    }

    return true;
  });

  const stats = {
    total: filteredLogs?.length || 0,
    thisWeek: filteredLogs?.filter((log) => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length || 0,
    thisMonth: filteredLogs?.filter((log) => {
      const logDate = new Date(log.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return logDate >= monthAgo;
    }).length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('workLog.title')}</h1>
        <Button variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          {t('workLog.export')}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('workLog.totalWorks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('workLog.lastWeek')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-week">
              {stats.thisWeek}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('workLog.lastMonth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-month">
              {stats.thisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
            <SelectTrigger data-testid="select-printer">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('workLog.allPrinters')}</SelectItem>
              {printers?.map((printer) => (
                <SelectItem key={printer.id} value={printer.id}>
                  {printer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger data-testid="select-date">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('workLog.last7Days')}</SelectItem>
              <SelectItem value="30">{t('workLog.last30Days')}</SelectItem>
              <SelectItem value="90">{t('workLog.last90Days')}</SelectItem>
              <SelectItem value="all">{t('workLog.allTime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('workLog.date')}</TableHead>
              <TableHead>{t('workLog.printer')}</TableHead>
              <TableHead>{t('workLog.task')}</TableHead>
              <TableHead>{t('workLog.additionalParams')}</TableHead>
              <TableHead>{t('workLog.performedBy')}</TableHead>
              <TableHead>{t('workLog.printHoursAtLog')}</TableHead>
              <TableHead>{t('workLog.jobs')}</TableHead>
              <TableHead>{t('workLog.notes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {t('workLog.noRecords')}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs?.map((log) => {
                const hasAdditionalParams = log.axis || log.nozzleSize || log.plasticType || log.customFieldValue;
                
                return (
                  <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                    <TableCell>
                      {format(new Date(log.date), "dd MMM yyyy, HH:mm", { locale: uk })}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{log.printer.name}</div>
                        {log.printer.model && (
                          <div className="text-sm text-muted-foreground">{log.printer.model}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.task ? (
                        <div>
                          <div>{log.task.title}</div>
                          {log.task.category && (
                            <Badge variant="outline" className="mt-1">
                              {log.task.category.name}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {hasAdditionalParams ? (
                        <div className="space-y-1 text-sm">
                          {log.axis && (
                            <div>
                              <span className="text-muted-foreground">{t('workLog.axisLabel')}</span> {log.axis}
                            </div>
                          )}
                          {log.nozzleSize && (
                            <div>
                              <span className="text-muted-foreground">{t('workLog.nozzleLabel')}</span> {log.nozzleSize}
                            </div>
                          )}
                          {log.plasticType && (
                            <div>
                              <span className="text-muted-foreground">{t('workLog.plasticLabel')}</span> {log.plasticType}
                            </div>
                          )}
                          {log.customFieldValue && (
                            <div>
                              <span className="text-muted-foreground">{t('workLog.otherLabel')}</span> {log.customFieldValue}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {log.performedBy || "-"}
                    </TableCell>
                    <TableCell>
                      {log.printHoursAtLog !== null ? log.printHoursAtLog : "-"}
                    </TableCell>
                    <TableCell>
                      {log.jobsCountAtLog !== null ? log.jobsCountAtLog : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {log.details || "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

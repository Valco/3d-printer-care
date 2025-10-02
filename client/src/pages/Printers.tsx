import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, QrCode, Calendar, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Printer = {
  id: string;
  name: string;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  ipAddress: string | null;
  notes: string | null;
  visibility: "PUBLIC" | "RESTRICTED";
  printHours: number;
  jobsCount: number;
  overdueCount: number;
  todayCount: number;
  groupAccess: Array<{
    groupId: string;
    group: { id: string; name: string };
  }>;
  emailRecipients: Array<{
    id: string;
    email: string;
  }>;
  schedules: Array<{
    id: string;
    taskId: string;
    isActive: boolean;
    nextDue: string | null;
    task: {
      id: string;
      title: string;
      priority: number;
    };
  }>;
};

type UserGroup = {
  id: string;
  name: string;
};

const printerSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  ipAddress: z.string().optional(),
  notes: z.string().optional(),
  visibility: z.enum(["PUBLIC", "RESTRICTED"]),
  groupIds: z.array(z.string()).optional(),
  emailRecipients: z.string().optional(),
});

type PrinterFormData = z.infer<typeof printerSchema>;

export default function Printers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: printers, isLoading } = useQuery<Printer[]>({
    queryKey: ["/api/printers"],
  });

  const { data: groups } = useQuery<UserGroup[]>({
    queryKey: ["/api/groups"],
  });

  const { data: allTasks } = useQuery<Array<{
    id: string;
    title: string;
    priority: number;
    category: { id: string; name: string } | null;
  }>>({
    queryKey: ["/api/tasks"],
  });

  const form = useForm<PrinterFormData>({
    resolver: zodResolver(printerSchema),
    defaultValues: {
      name: "",
      model: "",
      serialNumber: "",
      location: "",
      ipAddress: "",
      notes: "",
      visibility: "PUBLIC",
      groupIds: [],
      emailRecipients: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PrinterFormData) => {
      const emailList = data.emailRecipients
        ? data.emailRecipients.split(",").map((e) => e.trim()).filter(Boolean)
        : [];
      
      const res = await apiRequest("POST", "/api/printers", { ...data, emailRecipients: emailList });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/printers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Успіх",
        description: "Принтер успішно створено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося створити принтер",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PrinterFormData & { id: string }) => {
      const emailList = data.emailRecipients
        ? data.emailRecipients.split(",").map((e) => e.trim()).filter(Boolean)
        : [];
      
      const res = await apiRequest("PATCH", `/api/printers/${data.id}`, { ...data, emailRecipients: emailList });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/printers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsDialogOpen(false);
      setEditingPrinter(null);
      form.reset();
      toast({
        title: "Успіх",
        description: "Принтер успішно оновлено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити принтер",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/printers/${id}`);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/printers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Успіх",
        description: "Принтер успішно видалено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити принтер",
        variant: "destructive",
      });
    },
  });

  const addSchedule = useMutation({
    mutationFn: async ({ printerId, taskId }: { printerId: string; taskId: string }) => {
      const res = await apiRequest("POST", `/api/printers/${printerId}/schedules`, { taskId });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/printers"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      if (editingPrinter) {
        const updatedPrinters = queryClient.getQueryData<Printer[]>(["/api/printers"]);
        const updatedPrinter = updatedPrinters?.find(p => p.id === editingPrinter.id);
        if (updatedPrinter) {
          setEditingPrinter(updatedPrinter);
        }
      }
      
      toast({
        title: "Успіх",
        description: "Завдання додано до принтера",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка",
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/printers"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      if (editingPrinter) {
        const updatedPrinters = queryClient.getQueryData<Printer[]>(["/api/printers"]);
        const updatedPrinter = updatedPrinters?.find(p => p.id === editingPrinter.id);
        if (updatedPrinter) {
          setEditingPrinter(updatedPrinter);
        }
      }
      
      toast({
        title: "Успіх",
        description: "Завдання видалено з принтера",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (!editingPrinter) return;
    
    if (checked) {
      addSchedule.mutate({ printerId: editingPrinter.id, taskId });
    } else {
      const schedule = editingPrinter.schedules.find(s => s.taskId === taskId);
      if (schedule) {
        removeSchedule.mutate(schedule.id);
      }
    }
  };

  const handleCreate = () => {
    setEditingPrinter(null);
    form.reset({
      name: "",
      model: "",
      serialNumber: "",
      location: "",
      ipAddress: "",
      notes: "",
      visibility: "PUBLIC",
      groupIds: [],
      emailRecipients: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (printer: Printer) => {
    setEditingPrinter(printer);
    form.reset({
      name: printer.name,
      model: printer.model || "",
      serialNumber: printer.serialNumber || "",
      location: printer.location || "",
      ipAddress: printer.ipAddress || "",
      notes: printer.notes || "",
      visibility: printer.visibility,
      groupIds: printer.groupAccess.map((ga) => ga.groupId),
      emailRecipients: printer.emailRecipients.map((er) => er.email).join(", "),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Ви впевнені, що хочете видалити цей принтер?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleGenerateQR = async (id: string) => {
    try {
      const response = await fetch(`/api/printers/${id}/qr`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to generate QR");
      const data = await response.json();
      setQrCodeUrl(data.qrCode);
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося згенерувати QR код",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: PrinterFormData) => {
    if (editingPrinter) {
      updateMutation.mutate({ ...data, id: editingPrinter.id });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Принтери</h1>
        <Button onClick={handleCreate} data-testid="button-add-printer">
          <Plus className="h-4 w-4 mr-2" />
          Додати принтер
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>Розташування</TableHead>
              <TableHead>Видимість</TableHead>
              <TableHead>Годин</TableHead>
              <TableHead>Робіт</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Принтери не знайдено
                </TableCell>
              </TableRow>
            ) : (
              printers?.map((printer) => (
                <TableRow key={printer.id} data-testid={`row-printer-${printer.id}`}>
                  <TableCell className="font-medium">{printer.name}</TableCell>
                  <TableCell>{printer.model || "-"}</TableCell>
                  <TableCell>{printer.location || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={printer.visibility === "PUBLIC" ? "default" : "secondary"}>
                      {printer.visibility === "PUBLIC" ? "Публічний" : "Обмежений"}
                    </Badge>
                  </TableCell>
                  <TableCell>{printer.printHours}</TableCell>
                  <TableCell>{printer.jobsCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {printer.overdueCount > 0 && (
                        <Badge variant="destructive" data-testid={`badge-overdue-${printer.id}`}>
                          Прострочено: {printer.overdueCount}
                        </Badge>
                      )}
                      {printer.todayCount > 0 && (
                        <Badge className="bg-orange-500" data-testid={`badge-today-${printer.id}`}>
                          Сьогодні: {printer.todayCount}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleGenerateQR(printer.id)}
                        data-testid={`button-qr-${printer.id}`}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(printer)}
                        data-testid={`button-edit-${printer.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(printer.id)}
                        data-testid={`button-delete-${printer.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrinter ? "Редагувати принтер" : "Додати принтер"}
            </DialogTitle>
            <DialogDescription>
              {editingPrinter
                ? "Оновіть інформацію про принтер"
                : "Створіть новий принтер у системі"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Модель</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Серійний номер</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-serial" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Розташування</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP адреса</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-ip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Видимість</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-visibility">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Публічний</SelectItem>
                        <SelectItem value="RESTRICTED">Обмежений</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("visibility") === "RESTRICTED" && groups && (
                <FormField
                  control={form.control}
                  name="groupIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Групи доступу</FormLabel>
                      <div className="space-y-2">
                        {groups.map((group) => (
                          <label key={group.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(group.id)}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current, group.id]);
                                } else {
                                  field.onChange(current.filter((id) => id !== group.id));
                                }
                              }}
                              data-testid={`checkbox-group-${group.id}`}
                            />
                            {group.name}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="emailRecipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email отримувачі (через кому)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="email1@example.com, email2@example.com" data-testid="input-emails" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нотатки</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingPrinter ? "Оновити" : "Створити"}
                </Button>
              </DialogFooter>
            </form>
          </Form>

          {editingPrinter && allTasks && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2" data-testid="text-task-settings">
                <Settings className="h-5 w-5" />
                Налаштування завдань
              </h3>
              <p className="text-sm text-muted-foreground">
                Оберіть завдання, які актуальні для цього принтера
              </p>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12" data-testid="header-task-checkbox">Активне</TableHead>
                      <TableHead data-testid="header-task-name">Назва завдання</TableHead>
                      <TableHead data-testid="header-task-cat">Категорія</TableHead>
                      <TableHead data-testid="header-task-prio">Пріоритет</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTasks.map((task) => {
                      const isAssigned = editingPrinter.schedules.some(s => s.taskId === task.id);
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrCodeUrl} onOpenChange={() => setQrCodeUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR код принтера</DialogTitle>
            <DialogDescription>
              Скануйте цей QR код для швидкого доступу до принтера
            </DialogDescription>
          </DialogHeader>
          {qrCodeUrl && (
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

type Task = {
  id: string;
  title: string;
  categoryId: string | null;
  intervalType: "DAYS" | "PRINT_HOURS" | "JOB_COUNT";
  intervalValue: number;
  defaultInstructions: string | null;
  priority: number;
  requiresAxis: boolean;
  requiresNozzleSize: boolean;
  requiresPlasticType: boolean;
  customFieldLabel: string | null;
  customFieldType: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  schedules: Array<{
    id: string;
    printerId: string;
    printer: {
      id: string;
      name: string;
    };
  }>;
};

type Category = {
  id: string;
  name: string;
};

export default function Tasks() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const taskSchema = z.object({
    title: z.string().min(1, t('task.titleRequired')),
    categoryId: z.string().optional(),
    intervalType: z.enum(["DAYS", "PRINT_HOURS", "JOB_COUNT"]),
    intervalValue: z.coerce.number().min(1, t('task.valueMinError')),
    defaultInstructions: z.string().optional(),
    priority: z.coerce.number().min(1).max(10).default(5),
    requiresAxis: z.boolean().default(false),
    requiresNozzleSize: z.boolean().default(false),
    requiresPlasticType: z.boolean().default(false),
    customFieldLabel: z.string().optional(),
    customFieldType: z.enum(["TEXT", "NUMBER", "none"]).optional(),
  });

  type TaskFormData = z.infer<typeof taskSchema>;

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      intervalType: "DAYS",
      intervalValue: 30,
      defaultInstructions: "",
      priority: 5,
      requiresAxis: false,
      requiresNozzleSize: false,
      requiresPlasticType: false,
      customFieldLabel: "",
      customFieldType: "none",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: t('common.success'),
        description: t('task.createSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('task.createError'),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TaskFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDialogOpen(false);
      setEditingTask(null);
      form.reset();
      toast({
        title: t('common.success'),
        description: t('task.updateSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('task.updateError'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: t('common.success'),
        description: t('task.deleteSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('task.deleteError'),
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setEditingTask(null);
    form.reset({
      title: "",
      categoryId: "",
      intervalType: "DAYS",
      intervalValue: 30,
      defaultInstructions: "",
      priority: 5,
      requiresAxis: false,
      requiresNozzleSize: false,
      requiresPlasticType: false,
      customFieldLabel: "",
      customFieldType: "none",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      categoryId: task.categoryId || "",
      intervalType: task.intervalType,
      intervalValue: task.intervalValue,
      defaultInstructions: task.defaultInstructions || "",
      priority: task.priority,
      requiresAxis: task.requiresAxis,
      requiresNozzleSize: task.requiresNozzleSize,
      requiresPlasticType: task.requiresPlasticType,
      customFieldLabel: task.customFieldLabel || "",
      customFieldType: (task.customFieldType as "TEXT" | "NUMBER") || "none",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('task.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateMutation.mutate({ ...data, id: editingTask.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getIntervalTypeLabel = (type: string) => {
    switch (type) {
      case "DAYS":
        return t('task.daysLabel');
      case "PRINT_HOURS":
        return t('task.printHoursLabel');
      case "JOB_COUNT":
        return t('task.jobsLabel');
      default:
        return type;
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
        <h1 className="text-3xl font-bold">{t('nav.tasks')}</h1>
        <Button onClick={handleCreate} data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          {t('task.addTask')}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('task.title')}</TableHead>
              <TableHead>{t('task.category')}</TableHead>
              <TableHead>{t('task.intervalType')}</TableHead>
              <TableHead>{t('task.priority')}</TableHead>
              <TableHead>{t('printer.assignedTasks')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => (
                <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {task.category ? (
                      <Badge variant="outline">{task.category.name}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {t('task.intervalValue')}: {task.intervalValue} {getIntervalTypeLabel(task.intervalType)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={task.priority >= 7 ? "destructive" : task.priority >= 4 ? "default" : "secondary"}
                    >
                      {task.priority}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.schedules.length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {task.schedules.length} {t('nav.printers').toLowerCase()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(task)}
                        data-testid={`button-edit-${task.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(task.id)}
                        data-testid={`button-delete-${task.id}`}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? t('task.editTask') : t('task.addTask')}
            </DialogTitle>
            <DialogDescription>
              {editingTask ? t('task.updateInfo') : t('task.createInfo')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.title')} *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.category')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      defaultValue={field.value || "none"}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder={t('task.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">-</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intervalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('task.intervalType')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-interval-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DAYS">{t('task.days')}</SelectItem>
                          <SelectItem value="PRINT_HOURS">{t('task.printHours')}</SelectItem>
                          <SelectItem value="JOB_COUNT">{t('task.jobCount')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intervalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('task.intervalValue')} *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-interval-value" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.priority')} (1-10) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={10} {...field} data-testid="input-priority" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('task.instructions')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} data-testid="input-instructions" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium">{t('task.dynamicFields')}</h4>
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="requiresAxis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-requires-axis"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {t('task.requiresAxis')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiresNozzleSize"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-requires-nozzle"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {t('task.requiresNozzleSize')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiresPlasticType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-requires-plastic"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {t('task.requiresPlasticType')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="customFieldLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('task.customFieldLabel')}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={t('task.customField')} 
                            data-testid="input-custom-label"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customFieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('task.customFieldType')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-custom-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">-</SelectItem>
                            <SelectItem value="TEXT">{t('task.text')}</SelectItem>
                            <SelectItem value="NUMBER">{t('task.number')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingTask ? t('task.update') : t('task.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

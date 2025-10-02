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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";

type UserGroup = {
  id: string;
  name: string;
  description: string | null;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  printerAccess: Array<{
    printerId: string;
    printer: {
      id: string;
      name: string;
    };
  }>;
};

const groupSchema = z.object({
  name: z.string().min(1, "Назва обов'язкова"),
  description: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

export default function Groups() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<UserGroup[]>({
    queryKey: ["/api/groups"],
  });

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const res = await apiRequest("POST", "/api/groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Успіх",
        description: "Групу успішно створено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося створити групу",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: GroupFormData & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/groups/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsDialogOpen(false);
      setEditingGroup(null);
      form.reset();
      toast({
        title: "Успіх",
        description: "Групу успішно оновлено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити групу",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Успіх",
        description: "Групу успішно видалено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити групу",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setEditingGroup(null);
    form.reset({
      name: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (group: UserGroup) => {
    setEditingGroup(group);
    form.reset({
      name: group.name,
      description: group.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Ви впевнені, що хочете видалити цю групу?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: GroupFormData) => {
    if (editingGroup) {
      updateMutation.mutate({ ...data, id: editingGroup.id });
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
        <h1 className="text-3xl font-bold">Групи користувачів</h1>
        <Button onClick={handleCreate} data-testid="button-add-group">
          <Plus className="h-4 w-4 mr-2" />
          Додати групу
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead>Користувачів</TableHead>
              <TableHead>Доступ до принтерів</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Групи не знайдено
                </TableCell>
              </TableRow>
            ) : (
              groups?.map((group) => (
                <TableRow key={group.id} data-testid={`row-group-${group.id}`}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.description || "-"}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {group.users.length} користувач(ів)
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {group.printerAccess.length} принтер(ів)
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(group)}
                        data-testid={`button-edit-${group.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(group.id)}
                        disabled={group.users.length > 0}
                        data-testid={`button-delete-${group.id}`}
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
              {editingGroup ? "Редагувати групу" : "Додати групу"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Оновіть інформацію про групу користувачів"
                : "Створіть нову групу користувачів"}
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Опис</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-description" />
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
                  {editingGroup ? "Оновити" : "Створити"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

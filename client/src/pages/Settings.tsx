import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  groupId: string | null;
};

export default function Settings() {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      window.location.reload();
    },
  });

  const handleLogout = () => {
    if (confirm("Ви впевнені, що хочете вийти?")) {
      logoutMutation.mutate();
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Помилка",
        description: "Заповніть всі поля",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Помилка",
        description: "Нові паролі не співпадають",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Помилка",
        description: "Пароль має містити щонайменше 6 символів",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Інформація",
      description: "Зміна паролю наразі не реалізована",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Налаштування</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Профіль користувача</CardTitle>
            <CardDescription>
              Інформація про ваш акаунт
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ім'я</Label>
              <Input value={user?.name || ""} disabled data-testid="input-name" />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled data-testid="input-email" />
            </div>

            <div>
              <Label>Роль</Label>
              <Input
                value={
                  user?.role === "ADMIN"
                    ? "Адміністратор"
                    : user?.role === "OPERATOR"
                    ? "Оператор"
                    : "Переглядач"
                }
                disabled
                data-testid="input-role"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Зміна паролю</CardTitle>
            <CardDescription>
              Оновіть ваш пароль для входу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Старий пароль</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                data-testid="input-old-password"
              />
            </div>

            <div>
              <Label>Новий пароль</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>

            <div>
              <Label>Підтвердити новий пароль</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>

            <Button onClick={handleChangePassword} data-testid="button-change-password">
              Змінити пароль
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сесія</CardTitle>
            <CardDescription>
              Управління вашою сесією
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Вийти з системи
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
import { useTranslation } from "react-i18next";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  groupId: string | null;
};

export default function Settings() {
  const { t } = useTranslation();
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
    if (confirm(t("settings.logoutConfirm"))) {
      logoutMutation.mutate();
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordsDontMatch"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("common.success"),
      description: t("settings.passwordChangeNotImplemented"),
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return t("settings.roleAdmin");
      case "OPERATOR":
        return t("settings.roleOperator");
      default:
        return t("settings.roleViewer");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("settings.title")}</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.userProfile")}</CardTitle>
            <CardDescription>
              {t("settings.userProfileInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("settings.nameLabel")}</Label>
              <Input value={user?.name || ""} disabled data-testid="input-name" />
            </div>

            <div>
              <Label>{t("user.email")}</Label>
              <Input value={user?.email || ""} disabled data-testid="input-email" />
            </div>

            <div>
              <Label>{t("settings.roleLabel")}</Label>
              <Input
                value={getRoleLabel(user?.role || "")}
                disabled
                data-testid="input-role"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.changePassword")}</CardTitle>
            <CardDescription>
              {t("settings.changePasswordInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("settings.oldPassword")}</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                data-testid="input-old-password"
              />
            </div>

            <div>
              <Label>{t("settings.newPassword")}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>

            <div>
              <Label>{t("settings.confirmNewPassword")}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>

            <Button onClick={handleChangePassword} data-testid="button-change-password">
              {t("settings.changePasswordButton")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.session")}</CardTitle>
            <CardDescription>
              {t("settings.sessionInfo")}
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
              {t("settings.logoutButton")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

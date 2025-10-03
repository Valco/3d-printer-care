import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Mail, Save, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSMTPSettingsSchema, type InsertSMTPSettings } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

type SMTPSettings = {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  reminderTime: string;
};

export default function SMTPSettings() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: settings, isLoading } = useQuery<SMTPSettings>({
    queryKey: ["/api/smtp/settings"],
  });

  const formSchema = insertSMTPSettingsSchema.refine(
    (data) => {
      if (!settings && (!data.password || data.password.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: t("smtp.passwordRequired"),
      path: ["password"],
    }
  );

  const form = useForm<InsertSMTPSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: settings?.host || "",
      port: settings?.port || 587,
      secure: settings?.secure ?? true,
      username: settings?.username || "",
      password: "",
      fromName: settings?.fromName || "",
      fromEmail: settings?.fromEmail || "",
      reminderTime: settings?.reminderTime || "08:00",
    },
    values: settings ? {
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      username: settings.username,
      password: "",
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
      reminderTime: settings.reminderTime || "08:00",
    } : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertSMTPSettings) => {
      const res = await apiRequest("POST", "/api/smtp/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smtp/settings"] });
      toast({
        title: t("smtp.saveSuccess"),
        description: t("smtp.title"),
      });
      form.reset({
        ...form.getValues(),
        password: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message || t("smtp.saveError"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertSMTPSettings) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t("smtp.title")}</h1>
      </div>

      <div className="max-w-2xl">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("smtp.description")}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{t("smtp.configuration")}</CardTitle>
            <CardDescription>
              {t("smtp.providerInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="smtp.gmail.com" 
                          {...field} 
                          data-testid="input-smtp-host"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.hostLabel")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="587" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-smtp-port"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.portLabel")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("smtp.secureLabel")}
                        </FormLabel>
                        <FormDescription>
                          {t("smtp.secureInfo")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-smtp-secure"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("smtp.usernameLabel")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your-email@gmail.com" 
                          {...field}
                          data-testid="input-smtp-username"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.usernameInfo")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("smtp.passwordLabel")} {settings && t("smtp.passwordOptional")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={settings ? t("smtp.keepPassword") : t("smtp.passwordPlaceholder")}
                          {...field}
                          value={field.value || ""}
                          data-testid="input-smtp-password"
                        />
                      </FormControl>
                      <FormDescription>
                        {settings 
                          ? t("smtp.passwordUpdateInfo")
                          : t("smtp.passwordInfo")
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("smtp.fromNameLabel")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="3D Printer Care System" 
                          {...field}
                          data-testid="input-smtp-from-name"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.fromNameInfo")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("smtp.fromEmail")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="noreply@yourdomain.com" 
                          {...field}
                          data-testid="input-smtp-from-email"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.fromEmailInfo")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("smtp.reminderTimeLabel")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="time"
                          {...field}
                          value={field.value || "08:00"}
                          data-testid="input-smtp-reminder-time"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("smtp.reminderTimeInfo")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-smtp"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? t("smtp.saving") : t("smtp.saveSettings")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

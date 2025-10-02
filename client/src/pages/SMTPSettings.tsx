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

  const { data: settings, isLoading } = useQuery<SMTPSettings>({
    queryKey: ["/api/smtp/settings"],
  });

  const formSchema = insertSMTPSettingsSchema.refine(
    (data) => {
      // Пароль обов'язковий при початковому налаштуванні
      if (!settings && (!data.password || data.password.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Пароль обов'язковий при початковому налаштуванні",
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
        title: "Успішно збережено",
        description: "SMTP налаштування оновлено",
      });
      form.reset({
        ...form.getValues(),
        password: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося зберегти налаштування",
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
        <h1 className="text-3xl font-bold">SMTP налаштування</h1>
      </div>

      <div className="max-w-2xl">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Налаштуйте SMTP сервер для відправки email-нагадувань про техобслуговування. 
            Ці налаштування використовуються при розміщенні на власному сервері.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Конфігурація SMTP</CardTitle>
            <CardDescription>
              Введіть дані вашого SMTP провайдера (Gmail, SendGrid, Mailgun тощо)
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
                        Адреса SMTP сервера
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
                        Порт сервера (зазвичай 587 для TLS або 465 для SSL)
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
                          Використовувати SSL/TLS
                        </FormLabel>
                        <FormDescription>
                          Увімкніть для безпечного з'єднання (рекомендовано)
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
                      <FormLabel>Ім'я користувача / Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your-email@gmail.com" 
                          {...field}
                          data-testid="input-smtp-username"
                        />
                      </FormControl>
                      <FormDescription>
                        Логін для автентифікації на SMTP сервері
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
                      <FormLabel>Пароль {settings && "(опціонально)"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={settings ? "Залишити поточний пароль" : "Введіть пароль"}
                          {...field}
                          value={field.value || ""}
                          data-testid="input-smtp-password"
                        />
                      </FormControl>
                      <FormDescription>
                        {settings 
                          ? "Залиште порожнім щоб зберегти поточний пароль. Введіть новий пароль для оновлення."
                          : "Пароль або App Password для автентифікації"
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
                      <FormLabel>Ім'я відправника</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="3D Printer Care System" 
                          {...field}
                          data-testid="input-smtp-from-name"
                        />
                      </FormControl>
                      <FormDescription>
                        Ім'я, яке буде відображатися у відправника
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
                      <FormLabel>Email відправника</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="noreply@yourdomain.com" 
                          {...field}
                          data-testid="input-smtp-from-email"
                        />
                      </FormControl>
                      <FormDescription>
                        Email адреса, з якої надсилатимуться листи
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
                      <FormLabel>Надсилати нагадування в</FormLabel>
                      <FormControl>
                        <Input 
                          type="time"
                          {...field}
                          value={field.value || "08:00"}
                          data-testid="input-smtp-reminder-time"
                        />
                      </FormControl>
                      <FormDescription>
                        О котрій годині перевіряти термін виконання завдань і надсилати на емайл нагадування
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
                  {saveMutation.isPending ? "Збереження..." : "Зберегти налаштування"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

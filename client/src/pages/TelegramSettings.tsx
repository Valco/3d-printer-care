import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Save, AlertCircle, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTelegramSettingsSchema, type InsertTelegramSettings } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TelegramSettings = {
  id: string;
  chatId: string;
  enabled: boolean;
  notifyOverdue: boolean;
  notifyToday: boolean;
  hasBotToken: boolean;
};

export default function TelegramSettings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<TelegramSettings>({
    queryKey: ["/api/telegram/settings"],
  });

  const formSchema = insertTelegramSettingsSchema.refine(
    (data) => {
      // Токен обов'язковий при початковому налаштуванні
      if (!settings && (!data.botToken || data.botToken.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Bot token обов'язковий при початковому налаштуванні",
      path: ["botToken"],
    }
  );

  const form = useForm<InsertTelegramSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      botToken: "",
      chatId: settings?.chatId || "",
      enabled: settings?.enabled ?? true,
      notifyOverdue: settings?.notifyOverdue ?? true,
      notifyToday: settings?.notifyToday ?? true,
    },
    values: settings ? {
      botToken: "",
      chatId: settings.chatId,
      enabled: settings.enabled,
      notifyOverdue: settings.notifyOverdue,
      notifyToday: settings.notifyToday,
    } : undefined,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertTelegramSettings) => {
      const res = await apiRequest("POST", "/api/telegram/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/telegram/settings"] });
      toast({
        title: "Успішно збережено",
        description: "Telegram налаштування оновлено",
      });
      form.reset({
        ...form.getValues(),
        botToken: "",
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

  const handleSubmit = (data: InsertTelegramSettings) => {
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
        <MessageSquare className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Telegram налаштування</h1>
      </div>

      <div className="max-w-2xl">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Налаштуйте Telegram бота для відправки нагадувань про завдання з терміном виконання сьогодні або раніше.
            <a 
              href="https://core.telegram.org/bots#how-do-i-create-a-bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
            >
              Як створити бота <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Конфігурація Telegram Bot</CardTitle>
            <CardDescription>
              Створіть бота через @BotFather та отримайте токен і chat ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="botToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Token {settings?.hasBotToken && "(опціонально)"}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder={settings?.hasBotToken ? "Залишити поточний токен" : "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"} 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-telegram-bot-token"
                        />
                      </FormControl>
                      <FormDescription>
                        {settings?.hasBotToken 
                          ? "Залиште порожнім щоб зберегти поточний токен. Введіть новий токен для оновлення."
                          : "Токен отриманий від @BotFather"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="-1001234567890 або 123456789" 
                          {...field}
                          data-testid="input-telegram-chat-id"
                        />
                      </FormControl>
                      <FormDescription>
                        ID чату або групи куди надсилати повідомлення. Використайте @userinfobot для отримання.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Увімкнути сповіщення
                        </FormLabel>
                        <FormDescription>
                          Активувати Telegram нагадування
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-telegram-enabled"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyOverdue"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Сповіщення про прострочені завдання
                        </FormLabel>
                        <FormDescription>
                          Надсилати нагадування про завдання з терміном раніше сьогодні
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-telegram-notify-overdue"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyToday"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Сповіщення про сьогоднішні завдання
                        </FormLabel>
                        <FormDescription>
                          Надсилати нагадування про завдання з терміном сьогодні
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-telegram-notify-today"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-telegram"
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

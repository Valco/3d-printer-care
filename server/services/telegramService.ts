import { prisma } from "../prisma";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.SESSION_SECRET;
const ALGORITHM = "aes-256-cbc";

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined");
  }
  
  const parts = text.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Invalid encrypted format: missing IV or encrypted data");
  }
  
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function sendTelegramMessage(message: string): Promise<boolean> {
  try {
    const settings = await prisma.telegramSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings || !settings.botToken || !settings.enabled) {
      console.log("Telegram not configured or disabled. Skipping notification.");
      return false;
    }

    const botToken = decrypt(settings.botToken);
    const chatId = settings.chatId;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    console.log(`Telegram message sent to ${chatId}`);
    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

export async function sendTelegramTaskReminders(tasks: Array<{
  printerName: string;
  taskTitle: string;
  dueDate: Date;
  priority: string;
}>): Promise<void> {
  try {
    const settings = await prisma.telegramSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings || !settings.enabled) {
      console.log("Telegram notifications disabled. Skipping.");
      return;
    }

    if (tasks.length === 0) {
      console.log("No tasks due today. No Telegram reminders to send.");
      return;
    }

    // Формуємо повідомлення
    let message = "🔔 <b>Нагадування про техобслуговування</b>\n\n";
    message += `Сьогодні: ${new Date().toLocaleDateString("uk-UA")}\n\n`;
    message += `<b>Завдання на сьогодні:</b>\n`;

    tasks.forEach((task, index) => {
      message += `\n${index + 1}. ${task.taskTitle}\n`;
      message += `   Принтер: ${task.printerName}\n`;
      message += `   Пріоритет: ${task.priority}\n`;
    });

    await sendTelegramMessage(message);
    console.log(`Telegram task reminders sent for ${tasks.length} task(s)`);
  } catch (error) {
    console.error("Error sending Telegram task reminders:", error);
    throw error;
  }
}

import nodemailer from "nodemailer";
import { prisma } from "../prisma";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.SESSION_SECRET;
const ALGORITHM = "aes-256-cbc";

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined");
  }
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const settings = await prisma.sMTPSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      console.log("SMTP settings not configured. Skipping email notification.");
      return false;
    }

    const password = decrypt(settings.password);

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendTaskReminders(tasks: Array<{
  printerName: string;
  taskTitle: string;
  dueDate: Date;
  priority: string;
}>): Promise<void> {
  try {
    const recipients = await prisma.emailRecipient.findMany({
      where: { isActive: true },
    });

    if (recipients.length === 0) {
      console.log("No active email recipients configured. Skipping reminders.");
      return;
    }

    if (tasks.length === 0) {
      console.log("No tasks due today. No reminders to send.");
      return;
    }

    const taskListHtml = tasks
      .map(
        (task) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${task.printerName}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${task.taskTitle}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${task.priority}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Нагадування про завдання</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🔔 Нагадування про завдання на сьогодні</h2>
          <p>Доброго дня!</p>
          <p>Нагадуємо, що сьогодні потрібно виконати наступні завдання з обслуговування 3D принтерів:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Принтер</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Завдання</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Пріоритет</th>
              </tr>
            </thead>
            <tbody>
              ${taskListHtml}
            </tbody>
          </table>
          
          <p>Будь ласка, виконайте ці завдання та зафіксуйте результати в системі.</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Це автоматичне повідомлення з системи "Догляд за 3D принтерами"
          </p>
        </body>
      </html>
    `;

    const subject = `🔔 Нагадування: ${tasks.length} ${tasks.length === 1 ? 'завдання' : 'завдань'} на сьогодні`;

    for (const recipient of recipients) {
      await sendEmail(recipient.email, subject, html);
    }

    console.log(`Task reminders sent to ${recipients.length} recipient(s)`);
  } catch (error) {
    console.error("Error sending task reminders:", error);
  }
}

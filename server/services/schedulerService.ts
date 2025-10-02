import cron from "node-cron";
import { prisma } from "../prisma";
import { sendTaskReminders } from "./emailService";
import { sendTelegramTaskReminders } from "./telegramService";

let currentEmailScheduler: cron.ScheduledTask | null = null;
let currentTelegramScheduler: cron.ScheduledTask | null = null;

export async function initializeScheduler() {
  await updateEmailScheduler();
  await updateTelegramScheduler();
  console.log("Schedulers initialized");
}

export async function updateEmailScheduler() {
  // Зупиняємо попередній scheduler якщо існує
  if (currentEmailScheduler) {
    currentEmailScheduler.stop();
    currentEmailScheduler = null;
  }

  // Отримуємо час нагадувань з БД
  const smtpSettings = await prisma.sMTPSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const reminderTime = smtpSettings?.reminderTime || "08:00";
  const [hours, minutes] = reminderTime.split(":").map(Number);

  // Створюємо новий cron розклад
  const cronExpression = `${minutes} ${hours} * * *`;
  
  currentEmailScheduler = cron.schedule(cronExpression, async () => {
    console.log(`Running daily email task reminder check at ${reminderTime}...`);
    await checkAndSendEmailReminders();
  });

  console.log(`Email scheduler updated: Daily task reminders at ${reminderTime}`);
}

export async function updateTelegramScheduler() {
  // Зупиняємо попередній scheduler якщо існує
  if (currentTelegramScheduler) {
    currentTelegramScheduler.stop();
    currentTelegramScheduler = null;
  }

  // Отримуємо час нагадувань з БД
  const telegramSettings = await prisma.telegramSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const reminderTime = telegramSettings?.reminderTime || "08:00";
  const [hours, minutes] = reminderTime.split(":").map(Number);

  // Створюємо новий cron розклад
  const cronExpression = `${minutes} ${hours} * * *`;
  
  currentTelegramScheduler = cron.schedule(cronExpression, async () => {
    console.log(`Running daily Telegram task reminder check at ${reminderTime}...`);
    await checkAndSendTelegramReminders();
  });

  console.log(`Telegram scheduler updated: Daily task reminders at ${reminderTime}`);
}

export async function getTasksDueToday() {
  const printers = await prisma.printer.findMany({
    include: {
      schedules: {
        where: { isActive: true },
        include: { task: true },
      },
    },
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks: Array<{
    printerName: string;
    taskTitle: string;
    dueDate: Date;
    priority: string;
  }> = [];

  printers.forEach((printer) => {
    printer.schedules.forEach((schedule) => {
      if (schedule.nextDue && schedule.nextDue >= today && schedule.nextDue < tomorrow) {
        todayTasks.push({
          printerName: printer.name,
          taskTitle: schedule.task.title,
          dueDate: schedule.nextDue,
          priority: getPriorityLabel(schedule.task.priority),
        });
      }
    });
  });

  return todayTasks;
}

async function checkAndSendEmailReminders() {
  try {
    const todayTasks = await getTasksDueToday();

    if (todayTasks.length > 0) {
      console.log(`Found ${todayTasks.length} task(s) due today. Sending email reminders...`);
      await sendTaskReminders(todayTasks);
    } else {
      console.log("No tasks due today. No email reminders to send.");
    }
  } catch (error) {
    console.error("Error checking and sending email task reminders:", error);
  }
}

async function checkAndSendTelegramReminders() {
  try {
    const todayTasks = await getTasksDueToday();

    if (todayTasks.length > 0) {
      console.log(`Found ${todayTasks.length} task(s) due today. Sending Telegram reminders...`);
      await sendTelegramTaskReminders(todayTasks);
    } else {
      console.log("No tasks due today. No Telegram reminders to send.");
    }
  } catch (error) {
    console.error("Error checking and sending Telegram task reminders:", error);
  }
}

function getPriorityLabel(priority: number): string {
  if (priority >= 3) return "Високий";
  if (priority === 2) return "Середній";
  return "Низький";
}

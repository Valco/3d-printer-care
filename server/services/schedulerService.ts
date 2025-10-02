import cron from "node-cron";
import { prisma } from "../prisma";
import { sendTaskReminders } from "./emailService";

let currentScheduler: cron.ScheduledTask | null = null;

export async function initializeScheduler() {
  await updateScheduler();
  console.log("Scheduler initialized");
}

export async function updateScheduler() {
  // Зупиняємо попередній scheduler якщо існує
  if (currentScheduler) {
    currentScheduler.stop();
    currentScheduler = null;
  }

  // Отримуємо час нагадувань з БД
  const smtpSettings = await prisma.sMTPSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const reminderTime = smtpSettings?.reminderTime || "08:00";
  const [hours, minutes] = reminderTime.split(":").map(Number);

  // Створюємо новий cron розклад
  const cronExpression = `${minutes} ${hours} * * *`;
  
  currentScheduler = cron.schedule(cronExpression, async () => {
    console.log(`Running daily task reminder check at ${reminderTime}...`);
    await checkAndSendTaskReminders();
  });

  console.log(`Scheduler updated: Daily task reminders at ${reminderTime}`);
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

async function checkAndSendTaskReminders() {
  try {
    const todayTasks = await getTasksDueToday();

    if (todayTasks.length > 0) {
      console.log(`Found ${todayTasks.length} task(s) due today. Sending reminders...`);
      await sendTaskReminders(todayTasks);
    } else {
      console.log("No tasks due today. No reminders to send.");
    }
  } catch (error) {
    console.error("Error checking and sending task reminders:", error);
  }
}

function getPriorityLabel(priority: number): string {
  if (priority >= 3) return "Високий";
  if (priority === 2) return "Середній";
  return "Низький";
}

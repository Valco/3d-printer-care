import cron from "node-cron";
import { prisma } from "../prisma";
import { sendTaskReminders } from "./emailService";

export function initializeScheduler() {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily task reminder check at 8:00 AM...");
    await checkAndSendTaskReminders();
  });

  console.log("Scheduler initialized: Daily task reminders at 8:00 AM");
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

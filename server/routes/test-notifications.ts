import { Router } from "express";
import { prisma } from "../prisma";
import { sendTaskReminders } from "../services/emailService";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
}

router.post("/api/test/send-task-reminders", requireAdmin, async (req, res) => {
  try {
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

    if (todayTasks.length === 0) {
      return res.json({
        message: "No tasks due today. No reminders sent.",
        taskCount: 0,
      });
    }

    await sendTaskReminders(todayTasks);

    res.json({
      message: `Task reminders sent successfully for ${todayTasks.length} task(s)`,
      taskCount: todayTasks.length,
      tasks: todayTasks,
    });
  } catch (error) {
    console.error("Error sending test reminders:", error);
    res.status(500).json({ error: "Failed to send test reminders" });
  }
});

function getPriorityLabel(priority: number): string {
  if (priority >= 3) return "Високий";
  if (priority === 2) return "Середній";
  return "Низький";
}

export default router;

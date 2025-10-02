import { Router } from "express";
import { sendTaskReminders } from "../services/emailService";
import { getTasksDueToday } from "../services/schedulerService";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
}

router.post("/api/test/send-task-reminders", requireAdmin, async (req, res) => {
  try {
    const todayTasks = await getTasksDueToday();

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

export default router;

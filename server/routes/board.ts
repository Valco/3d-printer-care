import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/api/board", requireAuth, async (req, res) => {
  try {
    let printers;
    if (req.session.role === "ADMIN") {
      printers = await prisma.printer.findMany({
        include: {
          schedules: {
            where: { isActive: true },
            include: {
              task: {
                include: { category: true },
              },
            },
          },
        },
      });
    } else {
      printers = await prisma.printer.findMany({
        where: {
          OR: [
            { visibility: "PUBLIC" },
            {
              AND: [
                { visibility: "RESTRICTED" },
                {
                  groupAccess: {
                    some: {
                      groupId: req.session.groupId,
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          schedules: {
            where: { isActive: true },
            include: {
              task: {
                include: { category: true },
              },
            },
          },
        },
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const overdue: any[] = [];
    const todayTasks: any[] = [];
    const weekTasks: any[] = [];
    const upcoming: any[] = [];

    printers.forEach((printer) => {
      printer.schedules.forEach((schedule) => {
        const taskData = {
          id: schedule.id,
          title: schedule.task.title,
          printerName: printer.name,
          printerId: printer.id,
          priority: schedule.task.priority,
          dueDate: schedule.nextDue,
          taskId: schedule.task.id,
          category: schedule.task.category?.name,
        };

        if (!schedule.nextDue) {
          upcoming.push(taskData);
        } else if (schedule.nextDue < now) {
          overdue.push(taskData);
        } else if (schedule.nextDue >= today && schedule.nextDue < tomorrow) {
          todayTasks.push(taskData);
        } else if (schedule.nextDue >= tomorrow && schedule.nextDue < nextWeek) {
          weekTasks.push(taskData);
        } else {
          upcoming.push(taskData);
        }
      });
    });

    overdue.sort((a, b) => b.priority - a.priority);
    todayTasks.sort((a, b) => b.priority - a.priority);
    weekTasks.sort((a, b) => b.priority - a.priority);
    upcoming.sort((a, b) => b.priority - a.priority);

    res.json({
      overdue,
      today: todayTasks,
      week: weekTasks,
      upcoming,
    });
  } catch (error) {
    console.error("Board error:", error);
    res.status(500).json({ error: "Failed to fetch board data" });
  }
});

export default router;

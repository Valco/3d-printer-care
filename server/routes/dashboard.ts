import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/api/dashboard", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: { group: true },
    });

    let printers;
    if (req.session.role === "ADMIN") {
      printers = await prisma.printer.findMany({
        include: {
          schedules: {
            where: { isActive: true },
            include: { task: true },
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
            include: { task: true },
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

    let overdueCount = 0;
    let todayCount = 0;
    let upcomingCount = 0;

    const printersWithStatus = printers.map((printer) => {
      const overdueSchedules = printer.schedules.filter(
        (s) => s.nextDue && s.nextDue < now
      );
      const todaySchedules = printer.schedules.filter(
        (s) => s.nextDue && s.nextDue >= today && s.nextDue < tomorrow
      );
      const upcomingSchedules = printer.schedules.filter(
        (s) => s.nextDue && s.nextDue >= tomorrow && s.nextDue < nextWeek
      );

      overdueCount += overdueSchedules.length;
      todayCount += todaySchedules.length;
      upcomingCount += upcomingSchedules.length;

      return {
        id: printer.id,
        name: printer.name,
        model: printer.model,
        location: printer.location,
        visibility: printer.visibility,
        overdueCount: overdueSchedules.length,
        todayCount: todaySchedules.length,
        upcomingCount: upcomingSchedules.length,
        overdueTasks: overdueSchedules.map(s => ({
          id: s.id,
          taskTitle: s.task.title,
          nextDue: s.nextDue,
        })),
        todayTasks: todaySchedules.map(s => ({
          id: s.id,
          taskTitle: s.task.title,
          nextDue: s.nextDue,
        })),
        upcomingTasks: upcomingSchedules.map(s => ({
          id: s.id,
          taskTitle: s.task.title,
          nextDue: s.nextDue,
        })),
      };
    });

    res.json({
      totalPrinters: printers.length,
      overdueCount,
      todayCount,
      upcomingCount,
      printers: printersWithStatus,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;

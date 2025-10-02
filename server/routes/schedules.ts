import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/api/printers/:printerId/schedules", requireAuth, async (req, res) => {
  try {
    const { printerId } = req.params;

    const schedules = await prisma.printerTaskSchedule.findMany({
      where: { printerId },
      include: {
        task: {
          include: { category: true },
        },
      },
      orderBy: { nextDue: "asc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

router.post(
  "/api/printers/:printerId/schedules",
  requireRole("ADMIN", "OPERATOR"),
  async (req, res) => {
    try {
      const { printerId } = req.params;
      const { taskId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      const existing = await prisma.printerTaskSchedule.findUnique({
        where: {
          printerId_taskId: {
            printerId,
            taskId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({
          error: "Schedule already exists for this printer and task",
        });
      }

      const task = await prisma.maintenanceTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      let nextDue: Date | null = null;
      if (task.intervalType === "DAYS") {
        nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + task.intervalValue);
      }

      const schedule = await prisma.printerTaskSchedule.create({
        data: {
          printerId,
          taskId,
          isActive: true,
          nextDue,
        },
        include: {
          task: {
            include: { category: true },
          },
        },
      });

      res.status(201).json(schedule);
    } catch (error) {
      console.error("Create schedule error:", error);
      res.status(500).json({ error: "Failed to create schedule" });
    }
  }
);

router.patch("/api/schedules/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, lastCompleted, nextDue } = req.body;

    const existing = await prisma.printerTaskSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const schedule = await prisma.printerTaskSchedule.update({
      where: { id },
      data: {
        isActive,
        lastCompleted,
        nextDue,
      },
      include: {
        task: {
          include: { category: true },
        },
      },
    });

    res.json(schedule);
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

router.delete("/api/schedules/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.printerTaskSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    await prisma.printerTaskSchedule.delete({
      where: { id },
    });

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

export default router;

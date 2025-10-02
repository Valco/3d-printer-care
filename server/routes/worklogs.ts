import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

function calculateNextDue(
  task: { intervalType: string; intervalValue: number },
  currentPrinter: { printHours: number; jobsCount: number },
  completedAtMetrics: { printHours: number; jobsCount: number }
): Date | null {
  if (task.intervalType === "DAYS") {
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + task.intervalValue);
    return nextDue;
  } else if (task.intervalType === "PRINT_HOURS") {
    const hoursUsed = currentPrinter.printHours - completedAtMetrics.printHours;
    if (hoursUsed >= task.intervalValue) {
      return new Date();
    }
    return null;
  } else if (task.intervalType === "JOB_COUNT") {
    const jobsUsed = currentPrinter.jobsCount - completedAtMetrics.jobsCount;
    if (jobsUsed >= task.intervalValue) {
      return new Date();
    }
    return null;
  }
  return null;
}

router.get("/api/worklogs", requireAuth, async (req, res) => {
  try {
    const { printerId } = req.query;

    const where: any = {};
    if (printerId) {
      where.printerId = printerId as string;
    }

    const logs = await prisma.workLog.findMany({
      where,
      include: {
        printer: true,
        task: {
          include: { category: true },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(logs);
  } catch (error) {
    console.error("Get work logs error:", error);
    res.status(500).json({ error: "Failed to fetch work logs" });
  }
});

router.post("/api/worklogs", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const {
      printerId,
      taskId,
      nozzleSize,
      printHours,
      jobsCount,
      details,
      performedBy,
    } = req.body;

    if (!printerId) {
      return res.status(400).json({ error: "Printer ID is required" });
    }

    const printer = await prisma.printer.findUnique({
      where: { id: printerId },
    });

    if (!printer) {
      return res.status(404).json({ error: "Printer not found" });
    }

    const workLog = await prisma.workLog.create({
      data: {
        printerId,
        taskId,
        nozzleSize,
        printHoursAtLog: printHours || printer.printHours,
        jobsCountAtLog: jobsCount || printer.jobsCount,
        details,
        performedBy: performedBy || req.session.name,
      },
      include: {
        printer: true,
        task: true,
      },
    });

    if (printHours !== undefined) {
      await prisma.printer.update({
        where: { id: printerId },
        data: { printHours },
      });
    }

    if (jobsCount !== undefined) {
      await prisma.printer.update({
        where: { id: printerId },
        data: { jobsCount },
      });
    }

    if (taskId) {
      const task = await prisma.maintenanceTask.findUnique({
        where: { id: taskId },
      });

      if (task) {
        const schedule = await prisma.printerTaskSchedule.findUnique({
          where: {
            printerId_taskId: {
              printerId,
              taskId,
            },
          },
        });

        if (schedule) {
          const now = new Date();
          const updatedPrinter = await prisma.printer.findUnique({
            where: { id: printerId },
          });

          const completedMetrics = {
            printHours: updatedPrinter?.printHours || printer.printHours,
            jobsCount: updatedPrinter?.jobsCount || printer.jobsCount,
          };

          const nextDue = calculateNextDue(
            task,
            completedMetrics,
            completedMetrics
          );

          await prisma.printerTaskSchedule.update({
            where: { id: schedule.id },
            data: {
              lastCompleted: now,
              nextDue,
              lastCompletedPrintHours: completedMetrics.printHours,
              lastCompletedJobsCount: completedMetrics.jobsCount,
            },
          });
        }
      }
    }

    res.status(201).json(workLog);
  } catch (error) {
    console.error("Create work log error:", error);
    res.status(500).json({ error: "Failed to create work log" });
  }
});

router.delete("/api/worklogs/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.workLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Work log not found" });
    }

    await prisma.workLog.delete({
      where: { id },
    });

    res.json({ message: "Work log deleted successfully" });
  } catch (error) {
    console.error("Delete work log error:", error);
    res.status(500).json({ error: "Failed to delete work log" });
  }
});

export default router;

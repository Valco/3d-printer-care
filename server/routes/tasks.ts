import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    const tasks = await prisma.maintenanceTask.findMany({
      include: {
        category: true,
        schedules: {
          include: {
            printer: true,
          },
        },
      },
      orderBy: { priority: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.maintenanceTask.findUnique({
      where: { id },
      include: {
        category: true,
        schedules: {
          include: {
            printer: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

router.post("/api/tasks", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const {
      title,
      categoryId,
      intervalType,
      intervalValue,
      defaultInstructions,
      priority,
      requiresAxis,
      requiresNozzleSize,
      requiresPlasticType,
      customFieldLabel,
      customFieldType,
    } = req.body;

    if (!title || !intervalType || !intervalValue) {
      return res.status(400).json({
        error: "Title, interval type, and interval value are required",
      });
    }

    if (!["DAYS", "PRINT_HOURS", "JOB_COUNT"].includes(intervalType)) {
      return res.status(400).json({
        error: "Invalid interval type",
      });
    }

    const task = await prisma.maintenanceTask.create({
      data: {
        title,
        categoryId,
        intervalType,
        intervalValue: parseInt(intervalValue),
        defaultInstructions,
        priority: priority || 5,
        requiresAxis: requiresAxis || false,
        requiresNozzleSize: requiresNozzleSize || false,
        requiresPlasticType: requiresPlasticType || false,
        customFieldLabel: customFieldLabel || null,
        customFieldType: customFieldType === "none" ? null : customFieldType || null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/api/tasks/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      categoryId,
      intervalType,
      intervalValue,
      defaultInstructions,
      priority,
      requiresAxis,
      requiresNozzleSize,
      requiresPlasticType,
      customFieldLabel,
      customFieldType,
    } = req.body;

    const existing = await prisma.maintenanceTask.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data: {
        title,
        categoryId,
        intervalType,
        intervalValue: intervalValue ? parseInt(intervalValue) : undefined,
        defaultInstructions,
        priority,
        requiresAxis: requiresAxis !== undefined ? requiresAxis : undefined,
        requiresNozzleSize: requiresNozzleSize !== undefined ? requiresNozzleSize : undefined,
        requiresPlasticType: requiresPlasticType !== undefined ? requiresPlasticType : undefined,
        customFieldLabel: customFieldLabel !== undefined ? (customFieldLabel || null) : undefined,
        customFieldType: customFieldType !== undefined ? (customFieldType === "none" ? null : customFieldType) : undefined,
      },
      include: {
        category: true,
      },
    });

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/api/tasks/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.maintenanceTask.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.maintenanceTask.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

router.get("/api/categories", requireAuth, async (req, res) => {
  try {
    const categories = await prisma.taskCategory.findMany({
      include: {
        tasks: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/api/categories", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const category = await prisma.taskCategory.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.patch("/api/categories/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = await prisma.taskCategory.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/api/categories/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.taskCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    await prisma.taskCategory.delete({
      where: { id },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;

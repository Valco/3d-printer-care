import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";

const router = Router();

router.get("/api/groups", requireRole("ADMIN"), async (req, res) => {
  try {
    const groups = await prisma.userGroup.findMany({
      include: {
        users: true,
        printerAccess: {
          include: {
            printer: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.post("/api/groups", requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const group = await prisma.userGroup.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

router.patch("/api/groups/:id", requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.userGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    const group = await prisma.userGroup.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res.json(group);
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ error: "Failed to update group" });
  }
});

router.delete("/api/groups/:id", requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.userGroup.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Group not found" });
    }

    await prisma.userGroup.delete({
      where: { id },
    });

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

export default router;

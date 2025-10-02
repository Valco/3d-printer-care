import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import bcrypt from "bcrypt";

const router = Router();

router.get("/api/users", requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        telegramNickname: true,
        role: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/api/users", requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, email, telegramNickname, password, role, groupId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const validRoles = ["ADMIN", "OPERATOR", "VIEWER"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    if (groupId) {
      const group = await prisma.userGroup.findUnique({
        where: { id: groupId },
      });
      if (!group) {
        return res.status(400).json({ error: "Group not found" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        telegramNickname: telegramNickname || null,
        passwordHash,
        role: role || "VIEWER",
        groupId: groupId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        telegramNickname: true,
        role: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.patch("/api/users/:id", requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, telegramNickname, password, role, groupId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email && email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (role) {
      const validRoles = ["ADMIN", "OPERATOR", "VIEWER"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
    }

    if (groupId) {
      const group = await prisma.userGroup.findUnique({
        where: { id: groupId },
      });
      if (!group) {
        return res.status(400).json({ error: "Group not found" });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (telegramNickname !== undefined) updateData.telegramNickname = telegramNickname || null;
    if (role !== undefined) updateData.role = role;
    if (groupId !== undefined) updateData.groupId = groupId || null;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        telegramNickname: true,
        role: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/api/users/:id", requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.session.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;

import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";

const router = Router();

router.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "VIEWER",
      },
    });

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;
    req.session.groupId = user.groupId || undefined;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      groupId: user.groupId,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;
    req.session.groupId = user.groupId || undefined;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      groupId: user.groupId,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/api/auth/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    id: req.session.userId,
    name: req.session.name,
    email: req.session.email,
    role: req.session.role,
    groupId: req.session.groupId,
  });
});

export default router;

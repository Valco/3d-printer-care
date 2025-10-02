import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import printersRoutes from "./routes/printers";
import tasksRoutes from "./routes/tasks";
import dashboardRoutes from "./routes/dashboard";
import boardRoutes from "./routes/board";
import worklogsRoutes from "./routes/worklogs";
import schedulesRoutes from "./routes/schedules";
import groupsRoutes from "./routes/groups";
import usersRoutes from "./routes/users";
import smtpRoutes from "./routes/smtp";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(authRoutes);
  app.use(usersRoutes);
  app.use(printersRoutes);
  app.use(tasksRoutes);
  app.use(dashboardRoutes);
  app.use(boardRoutes);
  app.use(worklogsRoutes);
  app.use(schedulesRoutes);
  app.use(groupsRoutes);
  app.use(smtpRoutes);

  const httpServer = createServer(app);

  return httpServer;
}

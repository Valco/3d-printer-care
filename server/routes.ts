import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(authRoutes);

  const httpServer = createServer(app);

  return httpServer;
}

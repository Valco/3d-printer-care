import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const smtpSettings = pgTable("SMTPSettings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  secure: boolean("secure").notNull().default(true),
  username: text("username").notNull(),
  passwordEncrypted: text("passwordEncrypted"),
  fromName: text("fromName").notNull(),
  fromEmail: text("fromEmail").notNull(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertSMTPSettingsSchema = createInsertSchema(smtpSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordEncrypted: true,
}).extend({
  password: z.string().optional(),
});

export type InsertSMTPSettings = z.infer<typeof insertSMTPSettingsSchema>;
export type SMTPSettings = typeof smtpSettings.$inferSelect;

export const telegramSettings = pgTable("TelegramSettings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botToken: text("botToken").notNull(),
  chatId: text("chatId").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  notifyOverdue: boolean("notifyOverdue").notNull().default(true),
  notifyToday: boolean("notifyToday").notNull().default(true),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertTelegramSettingsSchema = createInsertSchema(telegramSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTelegramSettings = z.infer<typeof insertTelegramSettingsSchema>;
export type TelegramSettings = typeof telegramSettings.$inferSelect;

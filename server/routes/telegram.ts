import { Router } from "express";
import { prisma } from "../prisma";
import crypto from "crypto";

const router = Router();

// Функції для шифрування/дешифрування токенів
const ENCRYPTION_KEY = process.env.SESSION_SECRET;
const ALGORITHM = "aes-256-cbc";

if (!ENCRYPTION_KEY) {
  throw new Error("SESSION_SECRET environment variable is required for Telegram token encryption");
}

function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined");
  }
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined");
  }
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Middleware для перевірки ADMIN ролі
function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
}

// Отримати Telegram налаштування
router.get("/api/telegram/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.telegramSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      return res.json(null);
    }

    // Повертаємо без токену (клієнт не повинен бачити токен)
    res.json({
      id: settings.id,
      chatId: settings.chatId,
      enabled: settings.enabled,
      notifyOverdue: settings.notifyOverdue,
      notifyToday: settings.notifyToday,
      hasBotToken: !!settings.botToken,
    });
  } catch (error) {
    console.error("Error fetching Telegram settings:", error);
    res.status(500).json({ error: "Failed to fetch Telegram settings" });
  }
});

// Зберегти Telegram налаштування
router.post("/api/telegram/settings", requireAdmin, async (req, res) => {
  try {
    const { botToken, chatId, enabled, notifyOverdue, notifyToday } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Правильний парсинг boolean значень
    const enabledFlag = enabled === true || enabled === "true";
    const notifyOverdueFlag = notifyOverdue === true || notifyOverdue === "true";
    const notifyTodayFlag = notifyToday === true || notifyToday === "true";

    // Шифруємо токен якщо він наданий
    let botTokenEncrypted = null;
    if (botToken && botToken.trim()) {
      botTokenEncrypted = encrypt(botToken);
    }

    // Перевіряємо чи вже є налаштування
    const existingSettings = await prisma.telegramSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let savedSettings;
    if (existingSettings) {
      // Оновлюємо існуючі налаштування
      savedSettings = await prisma.telegramSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...(botTokenEncrypted ? { botToken: botTokenEncrypted } : {}),
          chatId,
          enabled: enabledFlag,
          notifyOverdue: notifyOverdueFlag,
          notifyToday: notifyTodayFlag,
        },
      });
    } else {
      // Створюємо нові налаштування
      if (!botToken || !botToken.trim()) {
        return res.status(400).json({ error: "Bot token is required for initial setup" });
      }
      
      savedSettings = await prisma.telegramSettings.create({
        data: {
          botToken: botTokenEncrypted!,
          chatId,
          enabled: enabledFlag,
          notifyOverdue: notifyOverdueFlag,
          notifyToday: notifyTodayFlag,
        },
      });
    }

    // Повертаємо без токену
    res.json({
      id: savedSettings.id,
      chatId: savedSettings.chatId,
      enabled: savedSettings.enabled,
      notifyOverdue: savedSettings.notifyOverdue,
      notifyToday: savedSettings.notifyToday,
      hasBotToken: !!savedSettings.botToken,
    });
  } catch (error) {
    console.error("Error saving Telegram settings:", error);
    res.status(500).json({ error: "Failed to save Telegram settings" });
  }
});

// Експортуємо також функції шифрування для використання в інших частинах програми
export { encrypt, decrypt };
export default router;

import { Router } from "express";
import { prisma } from "../prisma";
import crypto from "crypto";

const router = Router();

// Функції для шифрування/дешифрування паролів
const ENCRYPTION_KEY = process.env.SESSION_SECRET;
const ALGORITHM = "aes-256-cbc";

if (!ENCRYPTION_KEY) {
  throw new Error("SESSION_SECRET environment variable is required for SMTP password encryption");
}

function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text: string): string {
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

// Отримати SMTP налаштування
router.get("/api/smtp/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await prisma.sMTPSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!settings) {
      return res.json(null);
    }

    // Повертаємо без паролю (клієнт не повинен бачити пароль)
    res.json({
      id: settings.id,
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      username: settings.username,
      fromName: settings.fromName,
      fromEmail: settings.fromEmail,
      reminderTime: settings.reminderTime || "08:00",
    });
  } catch (error) {
    console.error("Error fetching SMTP settings:", error);
    res.status(500).json({ error: "Failed to fetch SMTP settings" });
  }
});

// Зберегти SMTP налаштування
router.post("/api/smtp/settings", requireAdmin, async (req, res) => {
  try {
    const { host, port, secure, username, password, fromName, fromEmail, reminderTime } = req.body;

    if (!host || !port || !username || !fromName || !fromEmail) {
      return res.status(400).json({ error: "All fields except password are required" });
    }

    // Перевірка email формату
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Правильний парсинг boolean значення
    const secureFlag = secure === true || secure === "true";

    // Шифруємо пароль якщо він наданий
    let passwordEncrypted = null;
    if (password && password.trim()) {
      passwordEncrypted = encrypt(password);
    }

    // Перевіряємо чи вже є налаштування
    const existingSettings = await prisma.sMTPSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let savedSettings;
    if (existingSettings) {
      // Оновлюємо існуючі налаштування
      savedSettings = await prisma.sMTPSettings.update({
        where: { id: existingSettings.id },
        data: {
          host,
          port: parseInt(port),
          secure: secureFlag,
          username,
          ...(passwordEncrypted ? { passwordEncrypted } : {}),
          fromName,
          fromEmail,
          reminderTime: reminderTime || "08:00",
        },
      });
    } else {
      // Створюємо нові налаштування
      if (!password || !password.trim()) {
        return res.status(400).json({ error: "Password is required for initial setup" });
      }
      
      savedSettings = await prisma.sMTPSettings.create({
        data: {
          host,
          port: parseInt(port),
          secure: secureFlag,
          username,
          passwordEncrypted: passwordEncrypted!,
          fromName,
          fromEmail,
          reminderTime: reminderTime || "08:00",
        },
      });
    }

    // Повертаємо без паролю
    res.json({
      id: savedSettings.id,
      host: savedSettings.host,
      port: savedSettings.port,
      secure: savedSettings.secure,
      username: savedSettings.username,
      fromName: savedSettings.fromName,
      fromEmail: savedSettings.fromEmail,
      reminderTime: savedSettings.reminderTime || "08:00",
    });
  } catch (error) {
    console.error("Error saving SMTP settings:", error);
    res.status(500).json({ error: "Failed to save SMTP settings" });
  }
});

// Експортуємо також функції шифрування для використання в інших частинах програми
export { encrypt, decrypt };
export default router;

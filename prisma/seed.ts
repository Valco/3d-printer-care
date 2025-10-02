import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const groups = await Promise.all([
    prisma.userGroup.upsert({
      where: { name: "Адмін" },
      update: {},
      create: { name: "Адмін", description: "Адміністратори системи" },
    }),
    prisma.userGroup.upsert({
      where: { name: "Технік" },
      update: {},
      create: { name: "Технік", description: "Технічні спеціалісти" },
    }),
    prisma.userGroup.upsert({
      where: { name: "Оператор" },
      update: {},
      create: { name: "Оператор", description: "Оператори принтерів" },
    }),
    prisma.userGroup.upsert({
      where: { name: "Користувач" },
      update: {},
      create: { name: "Користувач", description: "Користувачі з read-only доступом" },
    }),
  ]);

  console.log("Created groups:", groups.map(g => g.name));

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash,
        role: "ADMIN",
        groupId: groups[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: "technician@example.com" },
      update: {},
      create: {
        name: "Technician User",
        email: "technician@example.com",
        passwordHash,
        role: "OPERATOR",
        groupId: groups[1].id,
      },
    }),
    prisma.user.upsert({
      where: { email: "operator@example.com" },
      update: {},
      create: {
        name: "Operator User",
        email: "operator@example.com",
        passwordHash,
        role: "OPERATOR",
        groupId: groups[2].id,
      },
    }),
    prisma.user.upsert({
      where: { email: "viewer@example.com" },
      update: {},
      create: {
        name: "Viewer User",
        email: "viewer@example.com",
        passwordHash,
        role: "VIEWER",
        groupId: groups[3].id,
      },
    }),
  ]);

  console.log("Created users:", users.map(u => u.email));

  const categories = await Promise.all([
    prisma.taskCategory.upsert({
      where: { name: "Калібрування" },
      update: {},
      create: { name: "Калібрування", description: "Калібрування та налаштування" },
    }),
    prisma.taskCategory.upsert({
      where: { name: "Очищення" },
      update: {},
      create: { name: "Очищення", description: "Процедури очищення" },
    }),
    prisma.taskCategory.upsert({
      where: { name: "Змащування" },
      update: {},
      create: { name: "Змащування", description: "Змащування механізмів" },
    }),
    prisma.taskCategory.upsert({
      where: { name: "Заміна частин" },
      update: {},
      create: { name: "Заміна частин", description: "Заміна зношених компонентів" },
    }),
    prisma.taskCategory.upsert({
      where: { name: "Огляд" },
      update: {},
      create: { name: "Огляд", description: "Регулярні огляди" },
    }),
  ]);

  console.log("Created categories:", categories.map(c => c.name));

  await prisma.workLog.deleteMany({});
  await prisma.printerTaskSchedule.deleteMany({});
  await prisma.printer.deleteMany({});
  
  const printers = await Promise.all([
    prisma.printer.create({
      data: {
        name: "X1C-002",
        model: "BambuLab X1C",
        serialNumber: "X1C2023-002",
        location: "Lab Room 1",
        ipAddress: "192.168.1.101",
        visibility: "PUBLIC",
        printHours: 1250,
        jobsCount: 420,
      },
    }),
    prisma.printer.create({
      data: {
        name: "A1-001",
        model: "BambuLab A1",
        serialNumber: "A12023-001",
        location: "Lab Room 2",
        ipAddress: "192.168.1.102",
        visibility: "RESTRICTED",
        printHours: 850,
        jobsCount: 310,
      },
    }),
  ]);

  console.log("Created printers:", printers.map(p => p.name));

  await prisma.printerGroupAccess.create({
    data: {
      printerId: printers[1].id,
      groupId: groups[1].id,
    },
  });

  const emailRecipients = await Promise.all([
    prisma.printerEmailRecipient.create({
      data: { printerId: printers[0].id, email: "tech1@example.com" },
    }),
    prisma.printerEmailRecipient.create({
      data: { printerId: printers[0].id, email: "tech2@example.com" },
    }),
    prisma.printerEmailRecipient.create({
      data: { printerId: printers[1].id, email: "admin@example.com" },
    }),
    prisma.printerEmailRecipient.create({
      data: { printerId: printers[1].id, email: "operator@example.com" },
    }),
  ]);

  console.log("Created email recipients:", emailRecipients.length);

  await prisma.maintenanceTask.deleteMany({});

  const tasks = await Promise.all([
    prisma.maintenanceTask.create({
      data: {
        title: "Калібрування столу",
        categoryId: categories[0].id,
        intervalType: "DAYS",
        intervalValue: 30,
        priority: 9,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Очищення екструдера",
        categoryId: categories[1].id,
        intervalType: "PRINT_HOURS",
        intervalValue: 100,
        priority: 8,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Заміна сопла",
        categoryId: categories[3].id,
        intervalType: "PRINT_HOURS",
        intervalValue: 500,
        priority: 7,
        requiresNozzleSize: true,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Змащування осей",
        categoryId: categories[2].id,
        intervalType: "DAYS",
        intervalValue: 60,
        priority: 6,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Перевірка ременів",
        categoryId: categories[4].id,
        intervalType: "DAYS",
        intervalValue: 90,
        priority: 5,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Очищення столу",
        categoryId: categories[1].id,
        intervalType: "JOB_COUNT",
        intervalValue: 50,
        priority: 4,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Калібрування потоку",
        categoryId: categories[0].id,
        intervalType: "DAYS",
        intervalValue: 45,
        priority: 3,
        requiresNozzleSize: true,
        requiresPlasticType: true,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Заміна фільтра",
        categoryId: categories[3].id,
        intervalType: "PRINT_HOURS",
        intervalValue: 300,
        priority: 2,
      },
    }),
    prisma.maintenanceTask.create({
      data: {
        title: "Загальний огляд",
        categoryId: categories[4].id,
        intervalType: "DAYS",
        intervalValue: 14,
        priority: 10,
      },
    }),
  ]);

  console.log("Created tasks:", tasks.length);

  let scheduleCount = 0;
  for (const printer of printers) {
    for (const task of tasks) {
      let lastCompleted: Date | null = null;
      let nextDue: Date | null = null;

      const pastPercent = 0.8;
      
      if (task.intervalType === "DAYS") {
        const daysAgo = Math.floor(task.intervalValue * pastPercent);
        lastCompleted = new Date();
        lastCompleted.setDate(lastCompleted.getDate() - daysAgo);
        nextDue = new Date(lastCompleted);
        nextDue.setDate(nextDue.getDate() + task.intervalValue);
      } else if (task.intervalType === "PRINT_HOURS") {
        const hoursUsed = Math.floor(task.intervalValue * pastPercent);
        if (printer.printHours >= hoursUsed) {
          lastCompleted = new Date();
          lastCompleted.setHours(lastCompleted.getHours() - 24);
        }
      } else if (task.intervalType === "JOB_COUNT") {
        const jobsUsed = Math.floor(task.intervalValue * pastPercent);
        if (printer.jobsCount >= jobsUsed) {
          lastCompleted = new Date();
          lastCompleted.setDate(lastCompleted.getDate() - 7);
        }
      }

      await prisma.printerTaskSchedule.create({
        data: {
          printerId: printer.id,
          taskId: task.id,
          lastCompleted,
          nextDue,
          isActive: true,
        },
      });
      scheduleCount++;
    }
  }

  console.log("Created schedules:", scheduleCount);
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import QRCode from "qrcode";

const router = Router();

async function getPrintersForUser(userId: string, userRole: string, userGroupId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { group: true },
  });

  if (userRole === "ADMIN") {
    return await prisma.printer.findMany({
      include: {
        schedules: {
          include: { task: true },
        },
        groupAccess: {
          include: { group: true },
        },
        emailRecipients: true,
      },
      orderBy: { name: "asc" },
    });
  }

  const printers = await prisma.printer.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        {
          AND: [
            { visibility: "RESTRICTED" },
            {
              groupAccess: {
                some: {
                  groupId: userGroupId,
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      schedules: {
        include: { task: true },
      },
      groupAccess: {
        include: { group: true },
      },
      emailRecipients: true,
    },
    orderBy: { name: "asc" },
  });

  return printers;
}

router.get("/api/printers", requireAuth, async (req, res) => {
  try {
    const printers = await getPrintersForUser(
      req.session.userId!,
      req.session.role!,
      req.session.groupId
    );

    const printersWithStatus = await Promise.all(
      printers.map(async (printer) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const overdueCount = printer.schedules.filter(
          (s) => s.nextDue && s.nextDue < now && s.isActive
        ).length;

        const todayCount = printer.schedules.filter(
          (s) =>
            s.nextDue &&
            s.nextDue >= today &&
            s.nextDue < tomorrow &&
            s.isActive
        ).length;

        return {
          ...printer,
          overdueCount,
          todayCount,
        };
      })
    );

    res.json(printersWithStatus);
  } catch (error) {
    console.error("Get printers error:", error);
    res.status(500).json({ error: "Failed to fetch printers" });
  }
});

router.get("/api/printers/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const printer = await prisma.printer.findUnique({
      where: { id },
      include: {
        schedules: {
          include: { task: { include: { category: true } } },
        },
        groupAccess: {
          include: { group: true },
        },
        emailRecipients: true,
      },
    });

    if (!printer) {
      return res.status(404).json({ error: "Printer not found" });
    }

    if (
      printer.visibility === "RESTRICTED" &&
      req.session.role !== "ADMIN"
    ) {
      const hasAccess = printer.groupAccess.some(
        (access) => access.groupId === req.session.groupId
      );

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdueCount = printer.schedules.filter(
      (s) => s.nextDue && s.nextDue < now && s.isActive
    ).length;

    const todayCount = printer.schedules.filter(
      (s) =>
        s.nextDue &&
        s.nextDue >= today &&
        s.nextDue < tomorrow &&
        s.isActive
    ).length;

    res.json({
      ...printer,
      overdueCount,
      todayCount,
    });
  } catch (error) {
    console.error("Get printer error:", error);
    res.status(500).json({ error: "Failed to fetch printer" });
  }
});

router.post("/api/printers", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      location,
      ipAddress,
      notes,
      visibility,
      groupIds,
      emailRecipients,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const printer = await prisma.printer.create({
      data: {
        name,
        model,
        serialNumber,
        location,
        ipAddress,
        notes,
        visibility: visibility || "PUBLIC",
        printHours: 0,
        jobsCount: 0,
      },
    });

    if (visibility === "RESTRICTED" && groupIds && groupIds.length > 0) {
      await prisma.printerGroupAccess.createMany({
        data: groupIds.map((groupId: string) => ({
          printerId: printer.id,
          groupId,
        })),
      });
    }

    if (emailRecipients && emailRecipients.length > 0) {
      await prisma.printerEmailRecipient.createMany({
        data: emailRecipients.map((email: string) => ({
          printerId: printer.id,
          email,
        })),
      });
    }

    const createdPrinter = await prisma.printer.findUnique({
      where: { id: printer.id },
      include: {
        groupAccess: {
          include: { group: true },
        },
        emailRecipients: true,
      },
    });

    res.status(201).json(createdPrinter);
  } catch (error) {
    console.error("Create printer error:", error);
    res.status(500).json({ error: "Failed to create printer" });
  }
});

router.patch("/api/printers/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      model,
      serialNumber,
      location,
      ipAddress,
      notes,
      visibility,
      printHours,
      jobsCount,
      groupIds,
      emailRecipients,
    } = req.body;

    const existing = await prisma.printer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Printer not found" });
    }

    const printer = await prisma.printer.update({
      where: { id },
      data: {
        name,
        model,
        serialNumber,
        location,
        ipAddress,
        notes,
        visibility,
        printHours,
        jobsCount,
      },
    });

    if (visibility === "RESTRICTED" && groupIds !== undefined) {
      await prisma.printerGroupAccess.deleteMany({
        where: { printerId: id },
      });

      if (groupIds.length > 0) {
        await prisma.printerGroupAccess.createMany({
          data: groupIds.map((groupId: string) => ({
            printerId: id,
            groupId,
          })),
        });
      }
    }

    if (emailRecipients !== undefined) {
      await prisma.printerEmailRecipient.deleteMany({
        where: { printerId: id },
      });

      if (emailRecipients.length > 0) {
        await prisma.printerEmailRecipient.createMany({
          data: emailRecipients.map((email: string) => ({
            printerId: id,
            email,
          })),
        });
      }
    }

    const updatedPrinter = await prisma.printer.findUnique({
      where: { id },
      include: {
        groupAccess: {
          include: { group: true },
        },
        emailRecipients: true,
      },
    });

    res.json(updatedPrinter);
  } catch (error) {
    console.error("Update printer error:", error);
    res.status(500).json({ error: "Failed to update printer" });
  }
});

router.delete("/api/printers/:id", requireRole("ADMIN", "OPERATOR"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.printer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Printer not found" });
    }

    await prisma.printer.delete({
      where: { id },
    });

    res.json({ message: "Printer deleted successfully" });
  } catch (error) {
    console.error("Delete printer error:", error);
    res.status(500).json({ error: "Failed to delete printer" });
  }
});

router.get("/api/printers/:id/qr", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const printer = await prisma.printer.findUnique({
      where: { id },
    });

    if (!printer) {
      return res.status(404).json({ error: "Printer not found" });
    }

    const qrData = JSON.stringify({
      type: "printer",
      id: printer.id,
      name: printer.name,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;

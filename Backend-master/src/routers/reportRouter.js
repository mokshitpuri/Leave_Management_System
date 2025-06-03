const express = require("express");
const { PrismaClient } = require("@prisma/client");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/faculty-report", async (req, res) => {
  try {
    // Fetch all users with role "FACULTY" and include their leave records
    const facultyUsers = await prisma.user.findMany({
      where: {
        role: "FACULTY"
      },
      include: {
        Record: true
      }
    });

    // Initialize a PDF document
    const doc = new PDFDocument();
    const stream = new PassThrough();

    // Set headers for PDF file download
    res.setHeader("Content-Disposition", "attachment; filename=Faculty_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF to response stream
    doc.pipe(stream);
    stream.pipe(res);

    // Title
    doc.fontSize(18).text("Faculty Leave Report", { align: "center" });
    doc.moveDown(1.5);

    // Loop through each faculty user
    facultyUsers.forEach((user, index) => {
      doc
        .fontSize(14)
        .fillColor("#000")
        .text(`${index + 1}. ${user.firstName} ${user.lastName} (${user.username})`, { underline: true });

      doc
        .fontSize(12)
        .text(
          `Leave Balance → Casual: ${user.casualLeave}, Medical: ${user.medicalLeave}, Earned: ${user.earnedLeave}, Academic: ${user.academicLeave}`
        );

      if (user.Record.length === 0) {
        doc.fontSize(10).text("  No leave applications submitted.\n");
      } else {
        doc.fontSize(11).text("  Leave Applications:");
        user.Record.forEach((r, i) => {
          doc
            .fontSize(10)
            .text(
              `    ${i + 1}. ${r.type} | ${r.status} | From: ${r.from.toISOString().split("T")[0]} To: ${
                r.to.toISOString().split("T")[0]
              } | Reason: ${r.reqMessage} | Rejection Comment: ${r.rejMessage || "N/A"}`
            );
        });
      }

      doc.moveDown(1.2);
    });

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ error: "Failed to generate PDF report." });
  }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/download-report", async (req, res) => {
  try {
    const { leaveType } = req.query; // Get leave type from query parameter
    const users = await prisma.user.findMany();

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();

    res.setHeader("Content-Disposition", `attachment; filename=${leaveType}_Leave_Report.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(stream);
    stream.pipe(res);

    // Title
    doc.fontSize(22).fillColor("#1565C0").text(`${leaveType} Leave Report`, { align: "center" });
    doc.moveDown(1.5);

    for (const user of users) {
      const startX = doc.page.margins.left;
      let y = doc.y;

      // User name and role
      doc.fontSize(16).fillColor("#000").text(`${user.firstName} ${user.lastName}`, startX, y);
      y = doc.y + 2;
      doc.fontSize(12).fillColor("#666").text(`${user.role}`, startX, y);
      y = doc.y + 10;

      // Table headers
      doc.fontSize(12).fillColor("#000");
      doc.text("Leave Type", startX, y);
      doc.text("Allotted", startX + 200, y);
      doc.text("Consumed", startX + 300, y);
      doc.text("Remaining", startX + 400, y);

      y += 20;

      // Draw line under headers (after spacing)
      doc.moveTo(startX, y).lineTo(550, y).strokeColor("#1565C0").stroke();
      y += 10;

      const leaveTypes = [
        { name: "Casual Leave", allotted: 12, remaining: user.casualLeave || 0 },
        { name: "Academic Leave", allotted: 15, remaining: user.academicLeave || 0 },
        { name: "Earned Leave", allotted: 15, remaining: user.earnedLeave || 0 },
        { name: "Medical Leave", allotted: 10, remaining: user.medicalLeave || 0 },
      ];

      // Filter leave types based on the query parameter
      const filteredLeaveTypes = leaveType
        ? leaveTypes.filter((leave) => leave.name.toLowerCase().includes(leaveType.toLowerCase()))
        : leaveTypes;

      filteredLeaveTypes.forEach((leave) => {
        const consumed = leave.allotted - leave.remaining;

        doc.fontSize(11).fillColor("#333");
        doc.text(leave.name, startX, y);
        doc.text(leave.allotted.toString(), startX + 200, y);
        doc.text(consumed.toString(), startX + 300, y);
        doc.text(leave.remaining.toString(), startX + 400, y);

        y += 18;
      });

      // Bottom separator line
      y += 6;
      doc.moveTo(startX, y).lineTo(550, y).strokeColor("#ccc").stroke();
      doc.moveDown(2);
    }

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating PDF report");
  }
});

module.exports = router;
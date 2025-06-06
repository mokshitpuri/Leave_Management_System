require("dotenv").config();
const express = require("express");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/download-report", async (req, res) => {
  try {
    const { leaveType } = req.query;

    // Get all users and filter out directors
    const allUsers = await prisma.user.findMany();
    const users = allUsers.filter(
      (user) => user.role.toLowerCase() !== "director"
    );

    const records = await prisma.record.findMany({
      where: {
        status: "accepted",
      },
    });

    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${leaveType || "All"}_Leave_Report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(stream);
    stream.pipe(res);

    // Title
    doc.fontSize(22).fillColor("#1565C0").text(`${leaveType || "All"} Leave Report`, {
      align: "center",
    });
    doc.moveDown(2);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userRecords = records.filter((r) => r.username === user.username);

      // Add new page only for full report
      if (!leaveType && i !== 0) {
        doc.addPage();
      }

      const startX = doc.page.margins.left;
      let y = doc.y;

      // Name and Role (no label)
      doc.fontSize(16).fillColor("#000").text(`${user.firstName} ${user.lastName}`, startX, y);
      y += 20;
      doc.fontSize(12).fillColor("#666").text(user.role, startX, y);
      y += 10;

      doc.moveTo(startX, y + 10).lineTo(550, y + 10).strokeColor("#ccc").stroke();
      doc.moveDown(2);

      // Leave Info
      const leaveTypes = [
        { name: "Casual Leave", allotted: 12, remaining: user.casualLeave || 0 },
        { name: "Academic Leave", allotted: 15, remaining: user.academicLeave || 0 },
        { name: "Earned Leave", allotted: 15, remaining: user.earnedLeave || 0 },
        { name: "Medical Leave", allotted: 10, remaining: user.medicalLeave || 0 },
      ];

      const filteredLeaveTypes = leaveType
        ? leaveTypes.filter((leave) =>
            leave.name.toLowerCase().includes(leaveType.toLowerCase())
          )
        : leaveTypes;

      y = doc.y;

      // Table header
      doc.fontSize(12).fillColor("#000");
      doc.text("Leave Type", startX, y);
      doc.text("Allotted", startX + 200, y);
      doc.text("Consumed", startX + 300, y);
      doc.text("Remaining", startX + 400, y);
      y += 20;
      doc.moveTo(startX, y).lineTo(550, y).strokeColor("#1565C0").stroke();
      y += 10;

      // Table rows
      filteredLeaveTypes.forEach((leave) => {
        const consumed = leave.allotted - leave.remaining;

        doc.fontSize(11).fillColor("#333");
        doc.text(leave.name, startX, y);
        doc.text(leave.allotted.toString(), startX + 200, y);
        doc.text(consumed.toString(), startX + 300, y);
        doc.text(leave.remaining.toString(), startX + 400, y);
        y += 18;
      });

      y += 6;
      doc.moveTo(startX, y).lineTo(550, y).strokeColor("#ccc").stroke();

      // Graph only for full report
      if (!leaveType) {
        doc.moveDown(2);

        const chartX = startX;
        const chartY = doc.y + 10;
        const chartWidth = 400;
        const chartHeight = 100;

        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const monthLeaves = userRecords.filter(
            (r) => new Date(r.from).getMonth() === i
          );
          const days = monthLeaves.reduce((sum, leave) => {
            const from = new Date(leave.from);
            const to = leave.to ? new Date(leave.to) : from;
            return sum + (Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
          }, 0);
          return days;
        });

        const maxDays = Math.max(...monthlyData, 1);
        const barWidth = chartWidth / 12;

        doc.fontSize(12).text("Monthly Leave Graph (Days)", chartX, chartY - 20);
        doc.rect(chartX, chartY, chartWidth, chartHeight).stroke();

        for (let i = 0; i < 12; i++) {
          const barHeight = (monthlyData[i] / maxDays) * (chartHeight - 10);
          const barX = chartX + i * barWidth + 5;
          const barY = chartY + chartHeight - barHeight;

          doc.rect(barX, barY, barWidth - 8, barHeight).fill("#1565C0");
        }

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 12; i++) {
          const labelX = chartX + i * barWidth + 5;
          doc
            .fontSize(8)
            .fillColor("black")
            .text(months[i], labelX, chartY + chartHeight + 4, {
              width: barWidth - 8,
              align: "center",
            });
        }

        doc.moveDown(6);
      } else {
        doc.moveDown(2);
      }
    }

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating PDF report");
  }
});

module.exports = router;

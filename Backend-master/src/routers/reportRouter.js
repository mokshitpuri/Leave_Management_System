require("dotenv").config();
const express = require("express");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/download-report", async (req, res) => {
  try {
    const { leaveType } = req.query;

    // Fetch only faculty and HOD users (exclude director)
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.FACULTY, Role.HOD],
        },
      },
    });

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

    // Title in uppercase
    doc.fontSize(22).fillColor("#1565C0").text(`${(leaveType || "All").toUpperCase()} LEAVE REPORT`, {
      align: "center",
    });
    doc.moveDown(1.5);

    const isFullReport = !leaveType;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userRecords = records.filter((r) => r.username === user.username);

      if (isFullReport && i > 0) {
        doc.addPage();
      }

      // Name and role on left, role uppercase
      doc.fontSize(16).fillColor("#000").text(`${user.firstName} ${user.lastName}`, {
        align: "left",
      });
      doc.fontSize(12).fillColor("#666").text(user.role.toUpperCase(), {
        align: "left",
      });
      doc.moveDown(1);

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

      const startX = doc.page.margins.left;
      let y = doc.y;

      doc.fontSize(12).fillColor("#000");
      doc.text("Leave Type", startX, y);
      doc.text("Allotted", startX + 200, y);
      doc.text("Consumed", startX + 300, y);
      doc.text("Remaining", startX + 400, y);

      y += 20;
      doc.moveTo(startX, y).lineTo(550, y).strokeColor("#1565C0").stroke();
      y += 10;

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
      doc.moveDown(2);

      if (isFullReport) {
        // 📊 Generate bar chart with Y axis from 0 to 8
        const chartX = 60;
        let chartY = doc.y + 10;
        const chartWidth = 400;
        const chartHeight = 100;
        const maxYValue = 8;

        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const monthLeaves = userRecords.filter(
            (r) => new Date(r.from).getMonth() === i
          );
          const days = monthLeaves.reduce((sum, leave) => {
            const from = new Date(leave.from);
            const to = leave.to ? new Date(leave.to) : from;
            return sum + (Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
          }, 0);
          // Cap max days to maxYValue for chart height normalization
          return days > maxYValue ? maxYValue : days;
        });

        const barWidth = chartWidth / 12;

        // Draw Y axis labels from 0 to 8 (step 1)
        doc.fontSize(8).fillColor("#000");
        for (let v = 0; v <= maxYValue; v++) {
          const labelY = chartY + chartHeight - (v / maxYValue) * chartHeight - 4;
          doc.text(v.toString(), chartX - 20, labelY, { width: 15, align: "right" });
          // Draw horizontal grid line
          doc.moveTo(chartX, chartY + chartHeight - (v / maxYValue) * chartHeight)
             .lineTo(chartX + chartWidth, chartY + chartHeight - (v / maxYValue) * chartHeight)
             .strokeColor("#eee")
             .stroke();
        }

        doc.fontSize(12).fillColor("#000").text("Predective Analysis", chartX, chartY - 20);
        doc.rect(chartX, chartY, chartWidth, chartHeight).strokeColor("#000").stroke();

        // Bars
        for (let i = 0; i < 12; i++) {
          const barHeight = (monthlyData[i] / maxYValue) * chartHeight;
          const barX = chartX + i * barWidth + 5;
          const barY = chartY + chartHeight - barHeight;

          doc.rect(barX, barY, barWidth - 8, barHeight).fill("#1565C0");
        }

        // Month labels
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
      }
    }

    doc.end();
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating PDF report");
  }
});

module.exports = router;

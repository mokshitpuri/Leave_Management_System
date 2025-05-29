require("dotenv").config();
const express = require("express");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const prisma = require("../functions/prismaFunction");

const router = express.Router();

// Endpoint to download the full leave report for all faculties
router.get("/download-report", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        Record: true,
      },
    });

    const doc = new PDFDocument();
    const stream = new PassThrough();

    // Set headers
    res.setHeader("Content-Disposition", "attachment; filename=Faculty_Leave_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF output correctly
    doc.pipe(stream);
    stream.pipe(res);

    // Build PDF content
    doc.fontSize(18).text("Faculty Leave Report", { align: "center" });
    doc.moveDown();

    for (const user of users) {
      if (user.role === "FACULTY") {
        doc.fontSize(14).text(`Faculty: ${user.firstName} ${user.lastName}`);
        const userLeaves = user.Record;

        if (userLeaves.length === 0) {
          doc.text("  No leave records.\n");
        } else {
          userLeaves.forEach((leave, index) => {
            doc.fontSize(11).text(
              `  ${index + 1}. Leave Type: ${leave.type}, Status: ${leave.status}, ` +
              `From: ${leave.from.toISOString().split("T")[0]}, To: ${leave.to.toISOString().split("T")[0]}, ` +
              `Reason: ${leave.reqMessage}, Comment: ${leave.rejMessage || "N/A"}`
            );
          });
        }

        doc.moveDown();
      }
    }

    doc.end(); // Important: this finalizes the PDF stream
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating PDF report");
  }
});

module.exports = router;

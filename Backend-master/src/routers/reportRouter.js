require("dotenv").config();
const express = require("express");
const PDFDocument = require("pdfkit");
const prisma = require("../functions/prismaFunction"); // Adjust if necessary

const router = express.Router();

// Endpoint to download the full leave report for all faculties
router.get("/download-report", async (req, res) => {
  try {
    // Fetch all users with their leave records
    const users = await prisma.user.findMany({
      include: {
        Record: true, // Include leave records associated with the user
      },
    });

    const doc = new PDFDocument();

    // Set headers to force download with PDF file extension
    res.setHeader("Content-Disposition", "attachment; filename=Faculty_Leave_Report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF output to the response
    doc.pipe(res);

    // Generate the PDF document
    doc.fontSize(18).text("Faculty Leave Report", { align: "center" });
    doc.moveDown();

    // Loop through users and generate the PDF content
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

    doc.end(); // Finish and send the PDF document
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).send("Error generating PDF report");
  }
});

module.exports = router;

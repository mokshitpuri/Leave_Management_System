const express = require("express");
const leaveRouter = express.Router();
const authenticate = require("../middlewares/authentication");
const getUserInfo = require("../middlewares/getUserInfo");
const {
  createRecord,
  userLeaves,
  getApplications,
  updateStatus,
  updateleaves,
  consumeLeaveBalance,
} = require("../functions/prismaFunction");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// prefix string
// /leave/

leaveRouter.post("/apply", authenticate, getUserInfo, async (req, res) => {
  let username = req.userInfo.username;
  let stage = req.userInfo.role === "HOD" ? "DIRECTOR" : req.userInfo.role; // Set stage to "DIRECTOR" if HOD applies
  let status = undefined;
  let rejMessage = undefined;
  let { type, name, from, to, reqMessage } = req.body;

  if (!type || !name || !from || !to || !reqMessage) {
    return res.status(400).json({ error: { msg: "All fields are required" } });
  }

  // Calculate the number of days for the leave
  const days =
    Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

  // Check for duplicate leave name
  const existingLeaveByName = await prisma.record.findFirst({
    where: { username, name },
  });
  if (existingLeaveByName) {
    return res.status(400).json({ error: { msg: "Leave with this name already exists" } });
  }

  // Check for overlapping leave dates
  const overlappingLeave = await prisma.record.findFirst({
    where: {
      username,
      OR: [
        { from: { lte: new Date(to) }, to: { gte: new Date(from) } },
        { from: { gte: new Date(from) }, to: { lte: new Date(to) } },
      ],
    },
  });
  if (overlappingLeave) {
    return res.status(400).json({ error: { msg: "Leave dates overlap with an existing leave" } });
  }

  // Validate leave balance
  try {
    await updateleaves(req.userInfo, days, type); // Validate leave balance
  } catch (error) {
    return res.status(400).json({ error: { msg: error.message } });
  }

  try {
    // Create leave record
    let record = await createRecord({
      username,
      name,
      stage,
      type,
      from,
      to,
      status,
      reqMessage,
      rejMessage,
    });

    res.status(201).json({
      success: true,
      msg: "Leave applied successfully",
      body: record,
    });
  } catch (error) {
    console.error("Error posting leave:", error);
    return res.status(500).json({
      error: `Failed to post leave: ${error.message}`,
    });
  }
});

leaveRouter.get("/getLeaves", authenticate, getUserInfo, async (req, res) => {
  try {
    const { status } = req.query; // Accept status as a query parameter
    let leaves = await prisma.record.findMany({
      where: {
        username: req.userInfo.username,
        ...(status && { status }), // Filter by status if provided
      },
    });

    if (!leaves) {
      throw new Error("No leave records found");
    }

    res.status(200).json({
      success: true,
      body: leaves,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error.message);
    res.status(500).json({
      msg: "Internal server error",
      error: error.message,
    });
  }
});

leaveRouter.get("/getApplications", authenticate, getUserInfo, async (req, res) => {
  try {
    let role = req.userInfo.role;
    if (role === "FACULTY") {
      return res.status(403).json({ success: false, msg: "Not authorized for this operation" });
    }

    let applications;
    if (role === "HOD") {
      // Fetch applications for HOD (leaves submitted by FACULTY and not rejected)
      applications = await prisma.record.findMany({
        where: {
          stage: "FACULTY",
          status: { not: "rejected" },
        },
      });
    } else if (role === "DIRECTOR") {
      // Fetch applications for DIRECTOR (leaves accepted by HOD and marked as awaiting)
      applications = await prisma.record.findMany({
        where: {
          stage: "DIRECTOR",
          status: "awaiting",
        },
      });
    } else {
      applications = [];
    }

    res.status(200).json({ success: true, body: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(502).json({ success: false, error: error.message });
  }
});

leaveRouter.get("/updateStatus", authenticate, getUserInfo, async (req, res) => {
  try {
    const { status, name, reason } = req.query;

    // Validate input
    if (!status || (status !== "accepted" && status !== "rejected")) {
      return res.status(400).json({ error: "Invalid status. Use 'accepted' or 'rejected'." });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (status === "rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({ error: "Rejection reason is required." });
    }

    // Ensure only HOD or DIRECTOR can update the status
    if (req.userInfo.role !== "HOD" && req.userInfo.role !== "DIRECTOR") {
      return res.status(403).json({ error: "You are not authorized to accept or reject leaves." });
    }

    // Fetch the leave record
    const record = await prisma.record.findFirst({ where: { name } });

    if (!record) {
      return res.status(404).json({ error: "Leave record not found." });
    }

    let updatedRecord;

    if (req.userInfo.role === "HOD") {
      if (status === "accepted") {
        // Move to DIRECTOR stage but keep status as 'awaiting'
        updatedRecord = await prisma.record.update({
          where: { name },
          data: {
            stage: "DIRECTOR",
            status: "awaiting",
          },
        });
      } else if (status === "rejected") {
        // Mark as rejected and add rejection reason
        updatedRecord = await prisma.record.update({
          where: { name },
          data: {
            status: "rejected",
            rejMessage: reason,
          },
        });
      }
    } else if (req.userInfo.role === "DIRECTOR") {
      if (status === "accepted") {
        // Deduct leave balance when approved by DIRECTOR
        const days =
          Math.ceil(
            (new Date(record.to) - new Date(record.from)) / (1000 * 60 * 60 * 24)
          ) + 1;

        try {
          await consumeLeaveBalance(record.username, days, record.type);
        } catch (error) {
          console.error("Error in consumeLeaveBalance:", error.message);
          return res.status(500).json({ error: "Failed to update leave balance." });
        }
      }

      // DIRECTOR can finalize the status
      updatedRecord = await prisma.record.update({
        where: { name },
        data: {
          status,
          ...(status === "rejected" && { rejMessage: reason }),
        },
      });
    }

    res.status(200).json({ success: true, updatedRecord });
  } catch (error) {
    console.error("Error updating leave status:", error.message);
    res.status(500).json({ error: "Internal server error while updating status." });
  }
});

leaveRouter.get('/leave-stats', authenticate, getUserInfo, async (req, res) => {
  try {
    let username = req.userInfo.username;

    let totalLeaves = await prisma.record.count({ where: { username } });
    let approvedLeaves = await prisma.record.count({ where: { username, status: 'accepted' } });
    let pendingLeaves = await prisma.record.count({ where: { username, status: 'awaiting' } });

    res.status(200).json({
      success: true,
      data: {
        totalLeaves,
        approvedLeaves,
        pendingLeaves
      }
    });
  } catch (error) {
    console.error("Error fetching leave statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave statistics",
      error: error.message
    });
  }
});

leaveRouter.delete("/deleteLeave", authenticate, getUserInfo, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Leave name is required." });
    }

    // Fetch the leave record
    const leave = await prisma.record.findFirst({
      where: { name, username: req.userInfo.username, status: "accepted" },
    });

    if (!leave) {
      return res.status(404).json({ error: "Leave not found or cannot be deleted." });
    }

    // Calculate the number of days for the leave
    const days =
      Math.ceil((new Date(leave.to) - new Date(leave.from)) / (1000 * 60 * 60 * 24)) + 1;

    // Add back the leave days to the user's balance
    const field = `${leave.type}Leave`;
    const user = await prisma.user.findFirst({
      where: { username: req.userInfo.username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedBalance = user[field] + days;

    await prisma.user.update({
      where: { username: req.userInfo.username },
      data: {
        [field]: updatedBalance,
      },
    });

    // Delete the leave record
    await prisma.record.delete({
      where: { name },
    });

    res.status(200).json({ success: true, message: "Leave request canceled successfully." });
  } catch (error) {
    console.error("Error canceling leave request:", error.message);
    res.status(500).json({ error: "Internal server error while canceling leave request." });
  }
});

leaveRouter.delete("/clearRejectedLeave", authenticate, getUserInfo, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Leave name is required." });
    }

    const leave = await prisma.record.findFirst({
      where: { name, username: req.userInfo.username, status: "rejected" },
    });

    if (!leave) {
      return res.status(404).json({ error: "Rejected leave not found or cannot be cleared." });
    }

    // Delete the rejected leave record
    await prisma.record.delete({
      where: { name },
    });

    res.status(200).json({ success: true, message: "Rejected leave cleared successfully." });
  } catch (error) {
    console.error("Error clearing rejected leave:", error.message);
    res.status(500).json({ error: "Internal server error while clearing rejected leave." });
  }
});

module.exports = leaveRouter;
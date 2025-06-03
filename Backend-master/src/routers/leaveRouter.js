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
} = require("../functions/prismaFunction");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// prefix string
// /leave/

leaveRouter.post("/apply", authenticate, getUserInfo, async (req, res) => {
  let username = req.userInfo.username;
  let stage = req.userInfo.role;
  let status = undefined;
  let rejMessage = undefined;
  let { type, name, from, to, reqMessage, days } = req.body;

  if (!type || !name || !from || !to || !reqMessage || !days) {
    return res.status(400).json({ error: { msg: "All fields are required" } });
  }

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

  switch (type) {
    case "casual":
      if (req.userInfo.casualLeave < days) {
        return res.status(400).json({ error: { msg: "Not sufficient leaves" } });
      }
      break;
    case "medical":
      if (req.userInfo.medicalLeave < days) {
        return res.status(400).json({ error: { msg: "Not sufficient leaves" } });
      }
      break;
    case "earned":
      if (req.userInfo.earnedLeave < days) {
        return res.status(400).json({ error: { msg: "Not sufficient leaves" } });
      }
      break;
    case "academic":
      if (req.userInfo.academicLeave < days) {
        return res.status(400).json({ error: { msg: "Not sufficient leaves" } });
      }
      break;
    default:
      return res.status(400).json({ error: { msg: "Invalid leave type" } });
  }

  try {
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

    await updateleaves(req.userInfo, days, type);

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

    let applications = role === "HOD" 
      ? await getApplications("FACULTY") 
      : role === "DIRECTOR" 
      ? await getApplications("HOD") 
      : [];

    res.status(200).json({ success: true, body: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(502).json({ success: false, error: error.message });
  }
});

leaveRouter.get("/updateStatus", authenticate, getUserInfo, async (req, res) => {
  try {
    const { status, name, reason } = req.query;

    if (!status || (status !== "accepted" && status !== "rejected")) {
      return res.status(400).json({ error: "Invalid status. Use 'accepted' or 'rejected'." });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (status === "rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({ error: "Rejection reason is required." });
    }

    let updatedRecord;
    if (req.userInfo.role === "HOD") {
      updatedRecord = await updateStatus({ name, stage: "HOD", status, reason });
    } else if (req.userInfo.role === "DIRECTOR") {
      updatedRecord = await updateStatus({ name, stage: "DIRECTOR", status, reason });
    } else {
      return res.status(403).json({ error: "Not authorized for this request." });
    }

    res.status(200).json({ success: true, updatedRecord });
  } catch (error) {
    console.error("Error updating leave status:", error);
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

module.exports = leaveRouter;

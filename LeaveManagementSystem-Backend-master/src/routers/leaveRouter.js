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

// prefix string
// /leave/

leaveRouter.post("/apply", authenticate, getUserInfo, async (req, res) => {
  let username = req.userInfo.username;
  let stage = req.userInfo.role;
  let status = undefined;
  let rejMessage = undefined;
  let { type, name, from, to, reqMessage, days } = req.body;

  switch (type) {
    case "casual":
      if (req.userInfo.casualLeave < days) {
        return res.status(400).json({
          error: {
            msg: "Not sufficient leaves",
          },
        });
      }
      break;
    case "medical":
      if (req.userInfo.medicalLeave < days) {
        return res.status(400).json({
          error: {
            msg: "Not sufficient leaves",
          },
        });
      }
      break;
    case "earned":
      if (req.userInfo.earnedLeave < days) {
        return res.status(400).json({
          error: {
            msg: "Not sufficient leaves",
          },
        });
      }
      break;
    case "academic":
      if (req.userInfo.academicLeave < days) {
        return res.status(400).json({
          error: {
            msg: "Not sufficient leaves",
          },
        });
      }
      break;
    default:
      break;
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
      msg: "leave applied success",
      body: record,
    });
  } catch (error) {
    return res.status(500).json({
      error: `failed to post leave :- ${error}`,
    });
  }
});

leaveRouter.get("/getLeaves", authenticate, getUserInfo, async (req, res) => {
  try {
    let leaves = await userLeaves(req.userInfo.username);
    res.status(200).json({
      success: true,
      body: leaves,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal server Error",
      error: error,
    });
  }
});

leaveRouter.get(
  "/getApplications",
  authenticate,
  getUserInfo,
  async (req, res) => {
    let applications = undefined;
    try {
      let role = req.userInfo.role;
      if (role === "FACULTY") {
        res.status(400).json({
          success: false,
          msg: "Not authorized for this operation",
        });
      }
      if (role === "HOD") {
        applications = await getApplications("FACULTY");
      }
      if (role === "DIRECTOR") {
        applications = await getApplications("HOD");
      }

      res.status(200).json({
        success: true,
        body: applications,
      });
    } catch (error) {
      res.status(502).json({
        success: false,
        body: error,
      });
    }
  }
);

leaveRouter.get(
  "/updateStatus",
  authenticate,
  getUserInfo,
  async (req, res) => {
    try {
      const queryParam = req.query;

      if (
        !(queryParam.status === "accepted" || queryParam.status === "rejected")
      ) {
        res
          .send(400)
          .json({ error: "Wrong status given either give accept or reject" });
      }
      if (!queryParam.name) {
        res.send(400).json({ error: "Id is not provided" });
      }
      if (req.userInfo.role === "FACULTY") {
        res.status(400).json({
          msg: "Not authorized for this req",
        });
      }
      if (req.userInfo.role === "HOD") {
        let updatedRecord = await updateStatus({
          name: queryParam.name,
          stage: "HOD",
          status: queryParam.status,
        });
        res.status(200).send(updatedRecord);
      }

      if (req.userInfo.role === "DIRECTOR") {
        let updatedRecord = await updateStatus({
          name: queryParam.name,
          stage: "DIRECTOR",
          status: queryParam.status,
        });
        res.status(200).send(updatedRecord);
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send("Internal server error while performing updateStatus");
    }
  }
);

module.exports = leaveRouter;

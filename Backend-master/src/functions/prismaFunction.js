const { PrismaClient } = require("@prisma/client");
const { func } = require("joi");
const prisma = new PrismaClient();

async function findUser({ username, password }) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: password,
      },
    });

    return user || null;
  } catch (error) {
    console.error("Error finding user:", error);
    throw new Error("Database query failed");
  }
}

async function createUser({ username, password, firstName, lastName, role }) {
  let newUser = await prisma.user.create({
    data: {
      username,
      password,
      firstName,
      lastName,
      role,
    },
  });

  return newUser;
}

async function createRecord(data) {
  let {
    username,
    stage,
    type,
    from,
    to,
    name,
    status,
    reqMessage,
    rejMessage,
  } = data;
  let record = await prisma.record.create({
    data: {
      username,
      stage,
      type,
      from,
      name,
      to,
      status,
      reqMessage,
      rejMessage,
    },
  });

  return record;
}

async function userLeaves(username) {
  try {
    let leaves = await prisma.record.findMany({
      where: {
        username: username,
      },
    });
    return leaves;
  } catch (error) {
    throw new Error(error);
  }
}

async function getApplications(data) {
  try {
    let applications = await prisma.record.findMany({
      where: {
        stage: data,
      },
    });
    return applications;
  } catch (error) {
    throw new Error(error);
  }
}

async function updateStatus(data) {
  try {
    const record = await prisma.record.findFirst({
      where: { name: data.name },
    });

    if (!record) {
      throw new Error("Record not found");
    }

    if (data.stage === "DIRECTOR" && data.status === "accepted") {
      // Deduct leave days from user's balance
      const user = await prisma.user.findFirst({
        where: { username: record.username },
      });

      const days = Math.ceil((new Date(record.to) - new Date(record.from)) / (1000 * 60 * 60 * 24)) + 1;

      if (user[`${record.type}Leave`] < days) {
        throw new Error("Insufficient leave balance");
      }

      const updatedLeaveBalance = user[`${record.type}Leave`] - days;

      await prisma.user.update({
        where: { username: record.username },
        data: { [`${record.type}Leave`]: updatedLeaveBalance },
      });
    }

    const updatedRecord = await prisma.record.update({
      where: { name: data.name },
      data: {
        stage: data.stage,
        status: data.status,
        ...(data.status === "rejected" && { rejMessage: data.reason }),
      },
    });

    return updatedRecord;
  } catch (error) {
    console.error("Error in updateStatus:", error.message);
    throw new Error(error);
  }
}

async function updateleaves(userInfo, days, type) {
  try {
    let updateleave;
    let updatedDays;
    switch (type) {
      case "casual":
        updatedDays = userInfo.casualLeave - days;
        updateleave = await prisma.user.update({
          where: {
            username: userInfo.username,
          },
          data: {
            casualLeave: updatedDays,
          },
        });
        return updateleave;
        break;
      case "medical":
        updatedDays = userInfo.medicalLeave - days;
        updateleave = await prisma.user.update({
          where: {
            username: userInfo.username,
          },
          data: {
            medicalLeave: updatedDays,
          },
        });
        return updateleave;
        break;
      case "earned":
        updatedDays = userInfo.earnedLeave - days;
        updateleave = await prisma.user.update({
          where: {
            username: userInfo.username,
          },
          data: {
            earnedLeave: updatedDays,
          },
        });
        return updateleave;
        break;

      case "academic":
        updatedDays = userInfo.academicLeave - days;
        updateleave = await prisma.user.update({
          where: {
            username: userInfo.username,
          },
          data: {
            academicLeave: updatedDays,
          },
        });
        return updateleave;
        break;
    }
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  findUser,
  createUser,
  createRecord,
  userLeaves,
  getApplications,
  updateStatus,
  updateleaves,
};

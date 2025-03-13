const { PrismaClient } = require("@prisma/client");
const { func } = require("joi");
const prisma = new PrismaClient();

async function findUser({ username, password }) {
  let user = await prisma.user.findFirst({
    where: {
      username: username,
      password: password,
    },
  });
  if (user === null) return null;
  else return user;
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
    if (data.stage === "DIRECTOR") {
      let updatedRecord = await prisma.record.update({
        where: {
          name: data.name,
        },
        data: {
          stage: data.stage,
          status: data.status,
        },
      });
      return updatedRecord;
    } else {
      let dataObject = null;
      if (data.status === "rejected") {
        dataObject = {
          stage: data.stage,
          status: "rejected",
        };
      }
      if (data.status === "accepted") {
        dataObject = {
          stage: data.stage,
        };
      }
      let updatedRecord = await prisma.record.update({
        where: {
          name: data.name,
        },
        data: dataObject,
      });
      return updatedRecord;
    }
  } catch (error) {
    return new Error(error);
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

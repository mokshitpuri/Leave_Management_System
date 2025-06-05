const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 🔍 Find user for login
async function findUser({ username, password }) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
      },
    });
    return user || null;
  } catch (error) {
    console.error("Error finding user:", error.message);
    throw new Error("Database query failed");
  }
}

// 🧑‍💼 Create new user with duplicate username and full name clash check (case-insensitive)
async function createUser({ username, password, firstName, lastName, role }) {
  try {
    const usernameLower = username.toLowerCase();
    const fullNameLower = (firstName + lastName).toLowerCase();

    // Check if username already exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Check if full name and username clash (case-insensitive)
    const clashUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: fullNameLower,
              mode: "insensitive",
            },
          },
          {
            AND: [
              { firstName: { equals: firstName, mode: "insensitive" } },
              { lastName: { equals: lastName, mode: "insensitive" } },
            ],
          },
        ],
      },
    });

if (clashUser) {
  throw new Error(
    "A user with the same full name already exists. Please choose a different full name or username to avoid conflicts."
  );
}


    const newUser = await prisma.user.create({
      data: {
        username,
        password,
        firstName,
        lastName,
        role,
        casualLeave: 12,
        medicalLeave: 10,
        earnedLeave: 15,
        academicLeave: 15,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
}

// 📝 Create a new leave record
async function createRecord(data) {
  try {
    const {
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

    const record = await prisma.record.create({
      data: {
        username,
        stage,
        type,
        from,
        to,
        name,
        status,
        reqMessage,
        rejMessage,
      },
    });

    return record;
  } catch (error) {
    console.error("Error creating record:", error.message);
    throw error;
  }
}

// 📄 Get all leave records for a specific user
async function userLeaves(username) {
  try {
    const leaves = await prisma.record.findMany({
      where: { username },
    });
    return leaves;
  } catch (error) {
    console.error("Error fetching user leaves:", error.message);
    throw error;
  }
}

// 📥 Get applications at a specific stage (with optional rejected filter)
async function getApplications(stage, options = {}) {
  try {
    const { excludeRejected } = options;

    const applications = await prisma.record.findMany({
      where: {
        stage,
        ...(excludeRejected && { status: { not: "rejected" } }),
      },
    });

    return applications;
  } catch (error) {
    console.error("Error getting applications:", error.message);
    throw error;
  }
}

// ✅ Update record status and leave balance
async function updateStatus(data) {
  try {
    const record = await prisma.record.findFirst({
      where: { name: data.name },
    });

    if (!record) throw new Error("Record not found");

    // Final approval stage, update leave balance
    if (data.stage === "DIRECTOR" && data.status === "accepted") {
      const user = await prisma.user.findFirst({
        where: { username: record.username },
      });

      const days =
        Math.ceil(
          (new Date(record.to) - new Date(record.from)) / (1000 * 60 * 60 * 24)
        ) + 1;

      const balance = user[`${record.type}Leave`] || 0;
      if (balance < days) throw new Error("Insufficient leave balance");

      await prisma.user.update({
        where: { username: record.username },
        data: {
          [`${record.type}Leave`]: balance - days,
        },
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
    throw error;
  }
}

// 🔄 Manually deduct leave days (used if needed outside approval)
async function updateleaves(userInfo, days, type) {
  try {
    const field = `${type}Leave`;
    const newBalance = userInfo[field] - days;

    if (newBalance < 0) throw new Error("Leave balance cannot be negative");

    const updatedUser = await prisma.user.update({
      where: { username: userInfo.username },
      data: {
        [field]: newBalance,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating leave:", error.message);
    throw error;
  }
}

// Export all functions
module.exports = {
  findUser,
  createUser,
  createRecord,
  userLeaves,
  getApplications,
  updateStatus,
  updateleaves,
};

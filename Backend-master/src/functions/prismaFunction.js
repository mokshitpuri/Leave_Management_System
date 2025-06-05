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

    // Calculate the number of days for the leave
    const days =
      Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

    // Check if the user has sufficient leave balance
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) throw new Error("User not found");

    const availableBalance = user[`${type}Leave`] || 0;
    if (availableBalance < days) {
      throw new Error(
        `Insufficient leave balance. Available: ${availableBalance}, Requested: ${days}`
      );
    }

    // Create the leave record without deducting leave balance
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

    // Final approval stage, update leave balance only if accepted
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

      // Deduct leave days from the user's balance
      await prisma.user.update({
        where: { username: record.username },
        data: {
          [`${record.type}Leave`]: balance - days,
        },
      });
    }

    // Update the record status and rejection reason if applicable
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

    // Ensure the user has the leave type field
    if (!userInfo.hasOwnProperty(field)) {
      throw new Error(`Invalid leave type: ${type}`);
    }

    const currentBalance = userInfo[field];

    // Check if the user has sufficient leave balance
    if (currentBalance < days) {
      throw new Error(
        `Insufficient leave balance. Available: ${currentBalance}, Requested: ${days}`
      );
    }

    // If validation passes, return true
    return true;
  } catch (error) {
    console.error("Error validating leave:", error.message);
    throw error;
  }
}

// 🔄 Update leave balance when leave is consumed (e.g., accepted by the director)
async function consumeLeaveBalance(username, days, type) {
  try {
    const field = `${type}Leave`;

    // Fetch the user's current leave balance
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.hasOwnProperty(field)) {
      throw new Error(`Invalid leave type: ${type}`);
    }

    const currentBalance = user[field];

    // Check if the user has sufficient leave balance
    if (currentBalance < days) {
      throw new Error(
        `Insufficient leave balance. Available: ${currentBalance}, Requested: ${days}`
      );
    }

    // Deduct the leave days from the user's balance
    const newBalance = currentBalance - days;

    // Update the user's leave balance in the database
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        [field]: newBalance,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error in consumeLeaveBalance:", error.message);
    throw new Error("Failed to update leave balance.");
  }
}

// Delete a user by username
async function deleteUserByUsername(username) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { username },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user:", error.message);
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
  consumeLeaveBalance,
  deleteUserByUsername,
};

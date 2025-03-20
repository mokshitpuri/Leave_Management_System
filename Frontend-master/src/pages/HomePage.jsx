import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loggedInUser } from "../utils/functions/user";
import { Spinner, Image, Box } from "@chakra-ui/react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { leaveStats } from "../utils/functions/leave";

const COLORS = ["#1565C0", "#90CAF9"];


const facultyImages = {
  mokshit: "/images/mokshit.jpg",  
  harshill: "/images/harshil.jpg",  
  parthh: "/images/parth.jpg",     
};

// Default profile image if username is not found
const DEFAULT_IMAGE = "/images/user.png";

const Home = () => {
  const { data: userData, isLoading, error } = useQuery({
    queryFn: loggedInUser,
    queryKey: ["loggedInUser"],
  });

  const { data: leaveStatsData, isLoading: leaveStatsLoading, error: leaveStatsError } = useQuery({
    queryFn: leaveStats,
    queryKey: ["leaveStats"],
  });

  if (isLoading || leaveStatsLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );
  }

  if (error || leaveStatsError) {
    return (
      <div className="w-full h-full flex justify-center items-center text-red-500">
        Error: {error?.message || leaveStatsError?.message}
      </div>
    );
  }

  const leaveData = [
    { name: "Casual Leave", allotted: 12, remaining: userData?.casualLeave || 0 },
    { name: "Academic Leave", allotted: 15, remaining: userData?.academicLeave || 0 },
    { name: "Earned Leave", allotted: 15, remaining: userData?.earnedLeave || 0 },
    { name: "Medical Leave", allotted: 10, remaining: userData?.medicalLeave || 0 },
  ];

  // Assign the correct profile image based on the username
  const profileImage = facultyImages[userData?.username?.toLowerCase()] || DEFAULT_IMAGE;

  return (
    <div className="h-full w-full p-6">
      {/* Profile Card */}
      <div className="flex items-center bg-white p-6 shadow-xl rounded-xl space-x-6">
        <Image
          src={profileImage}
          boxSize="100px"
          alt="Profile Photo"
          className="rounded-full shadow-lg border-4 border-blue-400"
          objectFit= "cover"
        />
        <div>
          <p className="text-3xl font-bold text-gray-900">{userData?.username || "User"}</p>
          <p className="text-lg text-gray-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-2">
            {userData?.role || "N/A"}
          </p>
        </div>
      </div>

      {/* Leave Cards with Donut Chart */}
      <div className="flex justify-center flex-wrap gap-6 mt-8">
        {leaveData.map((leave, index) => {
          const consumedLeave = leave.allotted - leave.remaining;
          const chartData = [
            { name: "Consumed", value: consumedLeave },
            { name: "Remaining", value: leave.remaining },
          ];

          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg w-64 text-center">
              <p className="text-lg font-bold mb-3 text-gray-800">{leave.name}</p>
              <PieChart width={200} height={200}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="flex justify-between mt-2 text-gray-700">
                <p>Allotted: <span className="font-bold">{leave.allotted}</span></p>
                <p>Consumed: <span className="font-bold">{consumedLeave}</span></p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Summary Section */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow-xl text-center">
        <h3 className="text-2xl font-bold text-blue-600">Leave Summary</h3>
        <p className="text-gray-700 mt-2 text-lg">
          Total Leave Requests: <span className="font-bold text-blue-600">{leaveStatsData?.totalLeaves}</span>
        </p>
        <p className="text-gray-700 text-lg">
          Approved Leaves: <span className="font-bold text-green-600">{leaveStatsData?.approvedLeaves}</span>
        </p>
        <p className="text-gray-700 text-lg">
          Pending Approvals: <span className="font-bold text-yellow-600">{leaveStatsData?.pendingLeaves}</span>
        </p>
      </div>
    </div>
  );
};

export default Home;

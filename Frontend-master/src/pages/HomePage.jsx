import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loggedInUser } from "../utils/functions/user";
import { leaveRecord } from "../utils/functions/leave";
import {
  Spinner,
  Image,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as LineTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
} from "recharts";

const COLORS = ["#1565C0", "#90CAF9"];

const facultyImages = {
  mokshit: "/images/mokshit.jpg",
  harshil: "/images/harshil.jpg",
  parth: "/images/parth.jpg",
  dibakar: "/images/dibakar.jpg",
};

const DEFAULT_IMAGE = "/images/user.png";

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const leaves = payload[0].payload.leaves;
    return (
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px", padding: "8px", width: "220px" }}>
        <p><strong>Accepted Leaves ({label}):</strong></p>
        {leaves.map((leave, index) => (
          <div key={index} style={{ marginBottom: "4px", fontSize: "11px" }}>
            <p><strong>Type:</strong> {leave.type}</p>
            <p><strong>Days:</strong> {leave.days}</p>
            <p><strong>Date:</strong> {leave.dateRange}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Home = () => {
  const { data: userData, isLoading, error } = useQuery({
    queryFn: loggedInUser,
    queryKey: ["loggedInUser"],
  });

  const {
    data: leaveRecordData,
    isLoading: leaveLoading,
    error: leaveError,
    refetch,
  } = useQuery({
    queryFn: leaveRecord,
    queryKey: ["leaveRecord"],
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading || leaveLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner size="xl" color="blue.500" />
      </div>
    );
  }

  if (error || leaveError) {
    return (
      <div className="w-full h-full flex justify-center items-center text-red-500">
        Error: {error?.message || leaveError?.message}
      </div>
    );
  }

  const isDirector = userData?.role?.toLowerCase() === "director";

  const calcDays = (from, to) => {
    const start = new Date(from);
    const end = to ? new Date(to) : start;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const acceptedLeaves = (leaveRecordData || []).filter(
    (l) => l.status?.toLowerCase() === "accepted"
  );

  const monthlyChartData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthLeaves = acceptedLeaves.filter(
      (leave) => new Date(leave.from).getMonth() === monthIndex
    );

    const totalDays = monthLeaves.reduce(
      (sum, leave) => sum + calcDays(leave.from, leave.to),
      0
    );

    const details = monthLeaves.map((leave) => ({
      type: leave.type,
      days: calcDays(leave.from, leave.to),
      dateRange: `${new Date(leave.from).toLocaleDateString()} - ${
        leave.to ? new Date(leave.to).toLocaleDateString() : new Date(leave.from).toLocaleDateString()
      }`,
    }));

    return {
      month: new Date(0, monthIndex).toLocaleString("default", { month: "short" }),
      leaves: details,
      totalDays,
    };
  });

  const leaveData = [
    { name: "Casual Leave", allotted: 12, remaining: userData?.casualLeave || 0 },
    { name: "Academic Leave", allotted: 15, remaining: userData?.academicLeave || 0 },
    { name: "Earned Leave", allotted: 15, remaining: userData?.earnedLeave || 0 },
    { name: "Medical Leave", allotted: 10, remaining: userData?.medicalLeave || 0 },
  ];

  return (
    <div className="min-h-screen h-full w-full p-6">
      {/* Profile */}
      <div className="flex items-center bg-white p-6 shadow-xl rounded-xl space-x-6">
        <Image
          src={facultyImages[userData?.username?.toLowerCase()] || DEFAULT_IMAGE}
          boxSize="100px"
          alt="Profile"
          className="rounded-full shadow-lg border-4 border-blue-400"
          objectFit="cover"
        />
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {userData?.firstName} {userData?.lastName}
          </p>
          <p className="text-lg text-gray-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-2">
            {userData?.role}
          </p>
        </div>
      </div>

      {!isDirector && (
        <>
          {/* Donut Charts */}
          <div className="flex justify-center flex-wrap gap-6 mt-8">
            {leaveData.map((leave) => {
              const consumed = leave.allotted - leave.remaining;
              const pieData = [
                { name: "Consumed", value: consumed },
                { name: "Remaining", value: leave.remaining },
              ];

              return (
                <div key={leave.name} className="bg-gray-100 p-6 rounded-lg shadow-lg w-64 text-center">
                  <p className="text-lg font-bold mb-3 text-gray-800">{leave.name}</p>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <PieTooltip />
                  </PieChart>
                  <div className="flex justify-between mt-2 text-gray-700">
                    <p>
                      Allotted: <span className="font-bold">{leave.allotted}</span>
                    </p>
                    <p>
                      Consumed: <span className="font-bold">{consumed}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predictive Chart */}
          <div className="mt-8 p-6 bg-white rounded-xl shadow-xl text-center">
            <h3 className="text-2xl font-bold text-blue-600">Predictive Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} allowDecimals={false} />
                <Line type="monotone" dataKey="totalDays" stroke="#1565C0" activeDot={{ r: 8 }} />
                <LineTooltip content={<CustomLineTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;

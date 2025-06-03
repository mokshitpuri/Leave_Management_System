import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loggedInUser } from "../utils/functions/user";
import { Spinner, Image } from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { leaveRecord } from "../utils/functions/leave";

const COLORS = ["#1565C0", "#90CAF9"];

const facultyImages = {
  mokshit: "/images/mokshit.jpg",
  harshil: "/images/harshil.jpg",
  parth: "/images/parth.jpg",
  dibakar: "/images/dibakar.jpg",
};

const DEFAULT_IMAGE = "/images/user.png";

// ✅ FIXED: Recharts doesn't pass `coordinate` to CustomTooltip for LineChart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const leaves = payload[0].payload.leaves;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: "220px",
        }}
      >
        <p style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "6px" }}>
          Accepted Leaves ({label}):
        </p>
        {leaves.map((leave, index) => (
          <div key={index} style={{ marginBottom: "4px" }}>
            <p style={{ margin: 0, fontSize: "11px" }}>
              <strong>Type:</strong> {leave.type}
            </p>
            <p style={{ margin: 0, fontSize: "11px" }}>
              <strong>Days:</strong> {leave.days}
            </p>
            <p style={{ margin: 0, fontSize: "11px" }}>
              <strong>Date:</strong> {leave.dateRange}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Home = () => {
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryFn: loggedInUser,
    queryKey: ["loggedInUser"],
  });

  const {
    data: leaveRecordData,
    isLoading: leaveRecordLoading,
    error: leaveRecordError,
    refetch: refetchLeaveRecords,
  } = useQuery({
    queryFn: leaveRecord,
    queryKey: ["leaveRecord"],
  });

  useEffect(() => {
    refetchLeaveRecords();
  }, [refetchLeaveRecords]);

  if (isLoading || leaveRecordLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </div>
    );
  }

  if (error || leaveRecordError) {
    return (
      <div className="w-full h-full flex justify-center items-center text-red-500">
        Error: {error?.message || leaveRecordError?.message}
      </div>
    );
  }

  const leaveTypes = [
    { name: "Casual Leave", allotted: 12 },
    { name: "Academic Leave", allotted: 15 },
    { name: "Earned Leave", allotted: 15 },
    { name: "Medical Leave", allotted: 10 },
  ];

  const calcDays = (from, to) => {
    const start = new Date(from);
    const end = to ? new Date(to) : start;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const acceptedLeaveRecords = (leaveRecordData || []).filter(
    (leave) => leave.status === "accepted"
  );

  const donutChartData = leaveTypes.map((leaveType) => {
    const consumedLeave = acceptedLeaveRecords
      .filter(
        (record) =>
          record.type?.toLowerCase() === leaveType.name?.toLowerCase()
      )
      .reduce((total, record) => total + calcDays(record.from, record.to), 0);

    const allotted = leaveType.allotted || 0;

    return {
      name: leaveType.name,
      allotted,
      consumed: consumedLeave,
      remaining: Math.max(allotted - consumedLeave, 0),
    };
  });

  const chartData = Array.from({ length: 12 }, (_, monthIndex) => {
    const leavesInMonth = acceptedLeaveRecords.filter(
      (leave) => new Date(leave.from).getMonth() === monthIndex
    );

    const totalDays = leavesInMonth.reduce(
      (sum, leave) => sum + calcDays(leave.from, leave.to),
      0
    );

    const leavesDetail = leavesInMonth.map((leave) => ({
      type: leave.type,
      days: calcDays(leave.from, leave.to),
      dateRange: `${new Date(leave.from).toLocaleDateString()} - ${
        leave.to
          ? new Date(leave.to).toLocaleDateString()
          : new Date(leave.from).toLocaleDateString()
      }`,
    }));

    return {
      month: new Date(0, monthIndex).toLocaleString("default", {
        month: "short",
      }),
      leaves: leavesDetail,
      totalDays,
    };
  });

  return (
    <div className="min-h-screen h-full w-full p-6">
      {/* Profile Card */}
      <div className="flex items-center bg-white p-6 shadow-xl rounded-xl space-x-6">
        <Image
          src={
            facultyImages[userData?.username?.toLowerCase()] || DEFAULT_IMAGE
          }
          boxSize="100px"
          alt="Profile Photo"
          className="rounded-full shadow-lg border-4 border-blue-400"
          objectFit="cover"
        />
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {userData?.username || "User"}
          </p>
          <p className="text-lg text-gray-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-2">
            {userData?.role || "N/A"}
          </p>
        </div>
      </div>

      {/* Donut Charts */}
      <div className="flex justify-center flex-wrap gap-6 mt-8">
        {donutChartData.map((leave, index) => {
          const pieData = [
            { name: "Consumed", value: leave.consumed },
            { name: "Remaining", value: leave.remaining },
          ];

          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg w-64 text-center"
            >
              <p className="text-lg font-bold mb-3 text-gray-800">
                {leave.name}
              </p>
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
                    <Cell key={`cell-${i}`} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="flex justify-between mt-2 text-gray-700">
                <p>
                  Allotted: <span className="font-bold">{leave.allotted}</span>
                </p>
                <p>
                  Consumed: <span className="font-bold">{leave.consumed}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Predictive Analysis Line Chart */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow-xl text-center">
        <h3 className="text-2xl font-bold text-blue-600">Predictive Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              label={{ value: "Days", angle: -90, position: "insideLeft" }}
              allowDecimals={false}
            />
            <Line
              type="monotone"
              dataKey="totalDays"
              stroke="#1565C0"
              activeDot={{ r: 8 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Home;

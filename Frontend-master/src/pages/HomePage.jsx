import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loggedInUser } from "../utils/functions/user";
import { Spinner, Image, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box } from "@chakra-ui/react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import LeaveComponent from "../components/LeaveComponent";

const COLORS = ["#1565C0", "#90CAF9"];

const Home = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: loggedInUser,
    queryKey: ["loggedInUser"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );
  }

  // ✅ Prevent accessing undefined properties
  const leaveRecords = data?.leaveRecords || [];

  const leaveData = [
    { name: "Casual Leave", allotted: 12, remaining: data?.casualLeave || 0 },
    { name: "Academic Leave", allotted: 15, remaining: data?.academicLeave || 0 },
    { name: "Earned Leave", allotted: 15, remaining: data?.earnedLeave || 0 },
    { name: "Medical Leave", allotted: 10, remaining: data?.medicalLeave || 0 },
  ];

  return (
    <div className="h-full w-full p-6">
      {/* Profile Card */}
      <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
        <div>
          <p className="text-lg sm:text-2xl text-blue-500 font-semibold">Username</p>
          <p className="text-gray-700">{data?.username || "N/A"}</p>
          <p className="text-lg sm:text-2xl text-blue-500 font-semibold mt-2">Role</p>
          <p className="text-gray-700">{data?.role || "N/A"}</p>
        </div>
        <Image
          src="https://bit.ly/dan-abramov"
          boxSize="100px"
          alt="profile photo"
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Leave Cards with Donut Chart */}
      <div className="flex justify-center flex-wrap gap-6 mt-6">
        {leaveData.map((leave, index) => {
          const consumedLeave = leave.allotted - leave.remaining;

          const chartData = [
            { name: "Consumed", value: consumedLeave },
            { name: "Remaining", value: leave.remaining },
          ];

          return (
            <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-lg w-64 text-center">
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

      {/* Leave Records Table */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold text-blue-500 mb-4">Leave Records</h2>

        {/* Table */}
        <TableContainer>
          <Table variant="striped" colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Employee Name</Th>
                <Th>Leave Type</Th>
                <Th>Status</Th>
                <Th>Stage</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaveRecords.length > 0 ? (
                leaveRecords.map((leave, index) => (
                  <Tr key={index}>
                    <Td>{leave.name}</Td>
                    <Td>{leave.type}</Td>
                    <Td>
                      <Box
                        px={2}
                        py={1}
                        bg={leave.status === "accepted" ? "green.300" : leave.status === "rejected" ? "red.300" : "yellow.300"}
                        color="white"
                        borderRadius="md"
                        textAlign="center"
                      >
                        {leave.status}
                      </Box>
                    </Td>
                    <Td><LeaveComponent data={leave} /></Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="4" className="text-center text-gray-500">No leave records found.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Summary Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Leave Summary</h3>
          <p className="text-gray-600 mt-2">
            Total Leave Requests: <span className="font-bold">{leaveRecords.length}</span>
          </p>
          <p className="text-gray-600">
            Approved Leaves: <span className="font-bold">{leaveRecords.filter(l => l.status === "accepted").length}</span>
          </p>
          <p className="text-gray-600">
            Pending Approvals: <span className="font-bold">{leaveRecords.filter(l => l.status === "awaiting").length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

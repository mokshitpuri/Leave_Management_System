import React from "react";
import { useQuery } from "@tanstack/react-query";
import LeaveComponent from "../components/LeaveComponent";
import { Accordion, Spinner, Box } from "@chakra-ui/react";
import { leaveRecord } from "../utils/functions/leave";

const RecordsPage = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: leaveRecord,
    queryKey: ["leaveRecord"],
  });

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-screen text-xl text-gray-600">
        No data to show
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
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

  // Group leaves by their status
  const groupedLeaves = data.reduce((acc, leave) => {
    if (!acc[leave.status]) acc[leave.status] = [];
    acc[leave.status].push(leave);
    return acc;
  }, {});

  // Define order and labels for statuses
  const statuses = [
    { key: "accepted", label: "Accepted Leaves" },
    { key: "awaiting", label: "Awaiting Leaves" },
    { key: "rejected", label: "Rejected Leaves" },
  ];

  return (
    <div className="w-full min-h-screen p-10 bg-gray-100 flex flex-col space-y-10">
      {statuses.map(({ key, label }) => (
        <div key={key}>
          <h2 className="text-2xl font-semibold mb-6">{label}</h2>
          {groupedLeaves[key] && groupedLeaves[key].length > 0 ? (
            <Accordion allowMultiple className="w-full max-w-[90vw] mx-auto space-y-6">
              {groupedLeaves[key].map((leave, index) => (
                <Box key={index} className="shadow-lg rounded-xl overflow-hidden">
                  <LeaveComponent data={leave} />
                </Box>
              ))}
            </Accordion>
          ) : (
            <p className="text-gray-500 italic ml-4">No {label.toLowerCase()} found.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecordsPage;

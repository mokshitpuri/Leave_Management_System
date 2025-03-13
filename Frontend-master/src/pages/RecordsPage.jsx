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
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-10 bg-gray-100 flex flex-col space-y-6">
      <Accordion allowMultiple className="w-full max-w-[90vw] mx-auto space-y-6">
        {data.map((leave, index) => (
          <Box key={index} className="shadow-lg rounded-xl overflow-hidden">
            <LeaveComponent data={leave} />
          </Box>
        ))}
      </Accordion>
    </div>
  );
};

export default RecordsPage;

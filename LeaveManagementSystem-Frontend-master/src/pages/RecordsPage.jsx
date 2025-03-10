import React from "react";
import { useQuery } from "@tanstack/react-query";
import LeaveComponent from "../components/LeaveComponent";
import { Accordion } from "@chakra-ui/react";
import { leaveRecord } from "../utils/functions/leave";
import { Spinner } from "@chakra-ui/react";

const RecordsPage = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: leaveRecord,
    queryKey: ["leaveRecord"],
  });

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        No data to show
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        {" "}
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

  return (
    <div className="w-full  h-full">
      <Accordion allowMultiple className="p-2 flex flex-col space-y-2">
        {data.map((leave) => {
          return <LeaveComponent data={leave} />;
        })}
      </Accordion>
    </div>
  );
};

export default RecordsPage;

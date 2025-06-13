import React, { useState } from "react";
import { getApplications } from "../utils/functions/leave";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Accordion } from "@chakra-ui/react";
import ApplicationComponent from "../components/ApplicationComponent";

const ApplicationPage = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryFn: getApplications,
    queryKey: ["getApplication"],
  });

  const handleStatusUpdate = (updatedLeaveName) => {
    // Optionally filter out the leave locally if needed
    refetch(); // Refetch data to update the UI
  };

  if (isLoading)
    return (
      <div className="w-full flex justify-center items-center h-full">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </div>
    );

  if (error) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        Error occurred
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Accordion allowMultiple className="p-2 flex flex-col space-y-2">
        {data.map((leave) => (
          <ApplicationComponent
            key={leave.id}
            data={leave}
            onStatusUpdate={handleStatusUpdate}
            refetchApplications={refetch}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default ApplicationPage;

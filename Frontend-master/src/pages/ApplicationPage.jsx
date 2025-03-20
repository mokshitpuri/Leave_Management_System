import React from "react";
import { getApplications } from "../utils/functions/leave";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Accordion } from "@chakra-ui/react";
import ApplicationComponent from "../components/ApplicationComponent";

const ApplicationPage = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: getApplications,
    queryKey: ["getApplication"],
  });
  console.log(data);
  if (isLoading)
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

  if (error) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        Error occured
      </div>
    );
  }

  return (
<div className="w-full min-h-screen p-6 bg-gray-50">
  <Accordion allowMultiple className="w-full space-y-4 p-4 bg-white shadow-lg rounded-lg">
    {data.map((leave) => (
      <ApplicationComponent key={leave.id} data={leave} />
    ))}
  </Accordion>
</div>


  );
};

export default ApplicationPage;

import React, { useState } from "react";
import { getApplications } from "../utils/functions/leave";
import { useQuery } from "@tanstack/react-query";
import { Spinner, Accordion } from "@chakra-ui/react";
import ApplicationComponent from "../components/ApplicationComponent";

const ApplicationPage = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: getApplications,
    queryKey: ["getApplication"],
  });

  const [applications, setApplications] = useState([]);

  React.useEffect(() => {
    if (data) {
      // Filter only unattended applications
      setApplications(data.filter((app) => app.status === "pending"));
    }
  }, [data]);

  const handleStatusUpdate = (name) => {
    // Remove the application with the updated status
    setApplications((prev) => prev.filter((app) => app.name !== name));
  };

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
        Error occurred
      </div>
    );
  }

  return (
    <div className="w-full h-full ">
      <Accordion allowMultiple className="p-2 flex flex-col space-y-2">
        {applications.map((leave) => (
          <ApplicationComponent
            key={leave.id}
            data={leave}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default ApplicationPage;

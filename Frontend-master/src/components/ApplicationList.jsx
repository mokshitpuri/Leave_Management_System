import React, { useEffect, useState } from "react";
import { api } from "../utils/axios/instance";
import ApplicationComponent from "./ApplicationComponent";

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get("/leave/applications")
      .then((response) => setApplications(response.data))
      .catch((error) => console.error("Error fetching applications:", error));
  }, []);

  const handleStatusUpdate = (name) => {
    setApplications((prev) => prev.filter((app) => app.name !== name));
  };

  return (
    <div>
      {applications.map((app) => (
        <ApplicationComponent
          key={app.name}
          data={app}
          onStatusUpdate={handleStatusUpdate}
        />
      ))}
    </div>
  );
};

export default ApplicationList;

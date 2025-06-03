import { api } from "../axios/instance";

export async function leaveRecord() {
  return api
    .get("/leave/getLeaves", { params: { status: "accepted" } }) // Ensure only accepted leaves are fetched
    .then((response) => {
      if (!response.data.body) {
        throw new Error("No leave records found");
      }
      return response.data.body;
    })
    .catch((error) => {
      console.error("Error fetching leave records:", error.message);
      return Promise.reject(error);
    });
}

export async function leaveStats() {
  return api
    .get("/leave/leave-stats")
    .then((response) => {
  
        return response.data.data;
      
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

export async function getApplications() {
  return api
    .get("/leave/getApplications")
    .then((response) => {
      return response.data.body;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

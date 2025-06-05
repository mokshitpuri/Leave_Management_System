import { api } from "../axios/instance";

export async function leaveRecord() {
  return api
    .get("/leave/getLeaves") // fetch all leaves, no status filter
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

export async function deleteLeave(name) {
  return api
    .delete(`/leave/deleteLeave`, { params: { name } })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting leave request:", error.message);
      return Promise.reject(error);
    });
}

export async function clearRejectedLeave(name) {
  return api
    .delete(`/leave/clearRejectedLeave`, { params: { name } })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error clearing rejected leave:", error.message);
      return Promise.reject(error);
    });
}

import { api } from "../axios/instance";

export async function leaveRecord() {
  return api
    .get("/leave/getLeaves")
    .then((response) => {
        return response.data.body;

    })
    .catch((error) => {
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

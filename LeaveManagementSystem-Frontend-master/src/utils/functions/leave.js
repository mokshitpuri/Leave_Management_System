import { api } from "../axios/instance";

export async function leaveRecord() {
  return api
    .get("/leave/getLeaves")
    .then((response) => {
      if (response.data.body === undefined || response.data.body === null) {
        throw new Error("No record Found");
      } else {
        return response.data.body;
      }
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

import { api } from "../axios/instance";

export async function loggedInUser() {
  return api
    .get("/user/loggedInUser")
    .then((response) => {
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

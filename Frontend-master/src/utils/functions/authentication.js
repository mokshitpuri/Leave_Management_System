import { api } from "../axios/instance";

export function login(payload) {
  return api
    .post("/auth/login", payload)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);
      return Promise.resolve();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

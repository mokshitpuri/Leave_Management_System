import axios from "axios";

export const api = axios.create({
  // baseURL: "https://leavemanagementsystem-backend.onrender.com",
  baseURL: "http://localhost:3000",
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.request.status === 401) window.location.href = "/login";
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

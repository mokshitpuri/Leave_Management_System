import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Ensure the base URL points to port 3000
  headers: {
    "Content-Type": "application/json",
  },
});

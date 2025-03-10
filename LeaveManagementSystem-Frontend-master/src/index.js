import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/inter";
import App from "./App";
import "../src/index.css";
import { ChakraProvider } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
);

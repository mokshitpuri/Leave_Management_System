import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import DrawerComponent from "../components/Drawer";

const Dashboard = () => {
  return (
    <div className="w-screen h-screen">
      <DrawerComponent />
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Dashboard;

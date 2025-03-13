import React from "react";
import { useNavigate } from "react-router-dom";
import drawerContext from "../context/DrawerContext";

function DrawerConfig() {
  const { setOpen } = React.useContext(drawerContext);
  const navigate = useNavigate();

  // Get role from localStorage
  const getRole = () => localStorage.getItem("role");

  const faculty = [
    { title: "Home", path: "/dashboard/home" },
    { title: "Leave Records", path: "/dashboard/records" },
  ];

  const hod = [
    { title: "Home", path: "/dashboard/home" },
    { title: "Leave Records", path: "/dashboard/records" },
    { title: "Applications", path: "/dashboard/applications" },
  ];

  const director = [
    { title: "Home", path: "/dashboard/home" },
    { title: "Applications", path: "/dashboard/applications" },
  ];

  return (
    <div className="w-full h-full">
      {getRole() === "FACULTY"
        ? faculty.map((data, index) => (
            <div
              onClick={() => {
                navigate(data.path);
                setOpen(false);
              }}
              key={index}
              className="w-full py-2 px-4 hover:bg-blue-600 hover:text-white text-gray-300 text-md"
            >
              {data.title}
            </div>
          ))
        : getRole() === "HOD"
        ? hod.map((data, index) => (
            <div
              onClick={() => {
                navigate(data.path);
                setOpen(false);
              }}
              key={index}
              className="w-full py-2 px-4 hover:bg-blue-600 hover:text-white text-gray-300 text-md"
            >
              {data.title}
            </div>
          ))
        : director.map((data, index) => (
            <div
              onClick={() => {
                navigate(data.path);
                setOpen(false);
              }}
              key={index}
              className="w-full py-2 px-4 hover:bg-blue-600 hover:text-white text-gray-300 text-md"
            >
              {data.title}
            </div>
          ))}
    </div>
  );
}

export default DrawerConfig;

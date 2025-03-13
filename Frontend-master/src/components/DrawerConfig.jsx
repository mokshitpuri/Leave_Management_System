import React from "react";
import { useNavigate } from "react-router-dom";
import drawerContext from "../context/DrawerContext";

function DrawerConfig() {
  const { setOpen } = React.useContext(drawerContext);
  const navigate = useNavigate();
  // getting the role to render the drawer on the basis of roles
  const getRole = () => {
    let role = localStorage.getItem("role");
    return role;
  };

  const faculty = [
    {
      title: "Home",
      path: "/dashboard/home",
    },
    {
      title: "Apply Leave",
      path: "/dashboard/apply",
    },
    {
      title: "Leave Records",
      path: "/dashboard/records",
    },
  ];

  const hod = [
    {
      title: "Home",
      path: "/dashboard/home",
    },
    {
      title: "Apply Leave",
      path: "/dashboard/apply",
    },
    {
      title: "Leave Records",
      path: "/dashboard/records",
    },
    {
      title: "Applications",
      path: "/dashboard/applications",
    },
  ];

  const director = [
    {
      title: "Home",
      path: "/dashboard/home",
    },
    {
      title: "Applications",
      path: "/dashboard/applications",
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="w-full py-3 px-2 text-white text-md">
        {getRole().toUpperCase()}-CONTROLS
      </div>
      {/* ALL THE AVAILABLE OPTIONS */}
      {getRole() === "FACULTY"
        ? faculty.map((data, index) => (
            <div
              onClick={() => {
                navigate(data.path);
                setOpen(false);
              }}
              key={index}
              className="w-full py-2 px-4 hover:bg-slate-500 hover:text-gray-200 text-gray-300 text-md"
            >
              {data.title}
            </div>
          ))
        : getRole() === "HOD"
        ? hod.map((data, index) => {
            return (
              <div
                onClick={() => {
                  navigate(data.path);
                  setOpen(false);
                }}
                key={index}
                className="w-full py-2 px-4 hover:bg-slate-500 hover:text-gray-200 text-gray-100 text-md"
              >
                {data.title}
              </div>
            );
          })
        : director.map((data, index) => {
            return (
              <div
                onClick={() => {
                  navigate(data.path);
                  setOpen(false);
                }}
                key={index}
                className="w-full py-2 px-4 hover:bg-slate-500 hover:text-gray-200 text-gray-100 text-md"
              >
                {data.title}
              </div>
            );
          })}
    </div>
  );
}

export default DrawerConfig;

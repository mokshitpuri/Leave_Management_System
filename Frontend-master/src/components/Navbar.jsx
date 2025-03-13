import React from "react";
import { CiMenuBurger } from "react-icons/ci";
import { BiLogOut } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import DrawerContext from "../context/DrawerContext";
import { useMediaQuery } from "react-responsive";
import Drawer from "./Drawer";

function Navbar() {
  const { setOpen } = React.useContext(DrawerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const getRole = () => localStorage.getItem("role");

  const menuItems = {
    FACULTY: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Leave Records", path: "/dashboard/records" },
    ],
    HOD: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Leave Records", path: "/dashboard/records" },
      { title: "Applications", path: "/dashboard/applications" },
    ],
    DIRECTOR: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Applications", path: "/dashboard/applications" },
    ],
  };

  const role = getRole();
  const userMenu = menuItems[role] || [];

  return (
    <>
      {/* Navbar */}
      <div
        className="w-full fixed top-0 left-0 right-0 text-white flex justify-between items-center px-4 sm:px-8 py-3 shadow-md z-50"
        style={{ backgroundColor: "rgb(43, 66, 100)" }}
      >
        {/* Show Drawer Icon on Mobile */}
        {isMobile ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                className="px-3 py-2 rounded-lg transition"
                style={{ backgroundColor: "rgba(43, 66, 100, 0.8)" }}
                onClick={() => setOpen(true)}
              >
                <CiMenuBurger size={25} />
              </button>
            </div>
            <div>
              <button
                className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                style={{ color: "rgb(43, 66, 100)" }}
                onClick={() => navigate("/dashboard/apply")}
              >
                Apply Leave
              </button>
            </div>
          </div>
        ) : (
          // Show full menu on larger screens
          <div className="flex gap-6 items-center w-full justify-between">
            <div className="flex gap-6">
              {userMenu.map((item, index) => (
                <button
                  key={index}
                  className={`relative font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-[#d1e0ff] after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#d1e0ff]"
                      : "text-white hover:text-gray-300"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.title}
                </button>
              ))}
              {/* Apply Leave Button - Always visible on larger screens */}
              <button
                className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                style={{ color: "rgb(43, 66, 100)" }}
                onClick={() => navigate("/dashboard/apply")}
              >
                Apply Leave
              </button>
            </div>
            <button
              className="bg-red-500 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              <BiLogOut size={20} /> Logout
            </button>
          </div>
        )}
      </div>

      {/* Drawer for Mobile View */}
      {isMobile && <Drawer userMenu={userMenu} />}

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;

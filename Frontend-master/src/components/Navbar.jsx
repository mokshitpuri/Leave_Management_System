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

  const downloadReport = async (leaveType) => {
    const reportUrl = process.env.REACT_APP_REPORT_URL || "http://localhost:3000/report/download-report";
  
    try {
      const response = await fetch(`${reportUrl}?leaveType=${leaveType}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch the report");
      }
  
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${leaveType}_Leave_Report.pdf`;
      link.click();
      URL.revokeObjectURL(link.href); // Clean up blob URL
    } catch (error) {
      console.error("Error downloading the report:", error);
      alert("Failed to download the report. Please try again later."); // User-friendly error message
    }
  };
  
  // Example usage in menu items
  const menuItems = {
    DIRECTOR: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Applications", path: "/dashboard/applications" },
      {
        title: "Download Casual Leave Report",
        isExternal: true,
        path: "#",
        onClick: () => downloadReport("casual"),
      },
      {
        title: "Download Medical Leave Report",
        isExternal: true,
        path: "#",
        onClick: () => downloadReport("medical"),
      },
      {
        title: "Download Academic Leave Report",
        isExternal: true,
        path: "#",
        onClick: () => downloadReport("academic"),
      },
      {
        title: "Download Earned Leave Report",
        isExternal: true,
        path: "#",
        onClick: () => downloadReport("earned"),
      },
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
            <div className="flex gap-6 items-center">
              {userMenu.map((item, index) =>
                item.isExternal ? (
                  <button
                    key={index}
                    className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                    onClick={item.onClick}
                  >
                    {item.title}
                  </button>
                ) : (
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
                )
              )}

              {/* Apply Leave Button - Always visible on larger screens */}
              <button
                className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                style={{ color: "rgb(43, 66, 100)" }}
                onClick={() => navigate("/dashboard/apply")}
              >
                Apply Leave
              </button>
            </div>

            {/* Logout Button */}
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

import React from "react";
import { CiMenuBurger } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import drawerContext from "../context/DrawerContext";

function Navbar() {
  const { setOpen } = React.useContext(drawerContext);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <div className="w-full fixed top-0 left-0 right-0 text-white flex justify-between items-center px-4 sm:px-8 py-3 shadow-md z-50"
        style={{ backgroundColor: "rgb(43, 66, 100)" }}>
        {/* Menu Button */}
        <button
          className="px-3 py-2 rounded-lg transition"
          style={{ backgroundColor: "rgba(43, 66, 100, 0.8)" }}
          onClick={() => setOpen(true)}
        >
          <CiMenuBurger size={25} />
        </button>

        {/* Apply Leave Button - Only on Home Page */}
        {location.pathname === "/dashboard/home" && (
          <button
            className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
            style={{ color: "rgb(43, 66, 100)" }}
            onClick={() => navigate("/dashboard/apply")}
          >
            Apply Leave
          </button>
        )}
      </div>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;

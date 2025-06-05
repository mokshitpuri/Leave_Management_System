import React from "react";
import { CiMenuBurger } from "react-icons/ci";
import { BiLogOut } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import DrawerContext from "../context/DrawerContext";
import { useMediaQuery } from "react-responsive";
import Drawer from "./Drawer";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Stack,
  Text,
} from "@chakra-ui/react";
import { api } from "../utils/axios/instance"; // Ensure API instance is imported

function Navbar() {
  const { setOpen } = React.useContext(DrawerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const toast = useToast();

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
      link.download = `${leaveType || "Full"}_Leave_Report.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the report:", error);
      alert("Failed to download the report. Please try again later.");
    }
  };

  const handleResetAllLeaves = async () => {
    try {
      await api.post("/admin/reset-leaves", {
        casualLeave: 12,
        earnedLeave: 15,
        medicalLeave: 10,
        academicLeave: 15,
      });
      toast({
        title: "Success",
        description: "Leaves have been reset to default for all users.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      window.location.reload(); // Reload the page after resetting leaves
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset leaves. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const menuItems = {
    DIRECTOR: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Applications", path: "/dashboard/applications" },
      { title: "Add User", path: "/dashboard/add-user" },
      { title: "Manage Users", path: "/dashboard/manage-users" },
    ],
    HOD: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Leave Records", path: "/dashboard/records" },
      { title: "Applications", path: "/dashboard/applications" },
    ],
    FACULTY: [
      { title: "Home", path: "/dashboard/home" },
      { title: "Leave Records", path: "/dashboard/records" },
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
        {/* Mobile View */}
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
              {role !== "DIRECTOR" && (
                <button
                  className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                  style={{ color: "rgb(43, 66, 100)" }}
                  onClick={() => navigate("/dashboard/apply")}
                >
                  Apply Leave
                </button>
              )}
            </div>
          </div>
        ) : (
          // Desktop View
          <div className="flex gap-6 items-center w-full justify-between">
            {/* Left Side Navigation Items */}
            <div className="flex gap-6 items-center">
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
            </div>

            {/* Right Side: Report & Logout */}
            <div className="flex items-center gap-6">
              {/* Report Download (Visible for Director only) */}
              {role === "DIRECTOR" && (
                <Menu>
                  <MenuButton as={Button} colorScheme="blue">
                    Download Report
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => downloadReport("casual")}>Casual Leave</MenuItem>
                    <MenuItem onClick={() => downloadReport("medical")}>Medical Leave</MenuItem>
                    <MenuItem onClick={() => downloadReport("academic")}>Academic Leave</MenuItem>
                    <MenuItem onClick={() => downloadReport("earned")}>Earned Leave</MenuItem>
                    <MenuItem onClick={() => downloadReport("")}>Full Report</MenuItem>
                  </MenuList>
                </Menu>
              )}

              {/* Reset Leaves Button (Visible for Director only) */}
              {role === "DIRECTOR" && (
                <Popover>
                  <PopoverTrigger>
                    <Button colorScheme="red" ml={4}>
                      Reset All Leaves
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight="bold" fontSize="lg">
                      Confirm Reset
                    </PopoverHeader>
                    <PopoverBody>
                      <Text fontSize="md" color="black">
                        Are you sure you want to reset leaves for all users?
                      </Text>
                      <Stack direction="row" justifyContent="flex-end" mt="4">
                        <Button size="sm" onClick={handleResetAllLeaves} colorScheme="red">
                          Yes, Reset
                        </Button>
                      </Stack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              )}

              {/* Apply Leave Button (Visible for HOD and Faculty) */}
              {role !== "DIRECTOR" && (
                <button
                  className="bg-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
                  style={{ color: "rgb(43, 66, 100)" }}
                  onClick={() => navigate("/dashboard/apply")}
                >
                  Apply Leave
                </button>
              )}

              {/* Logout */}
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
          </div>
        )}
      </div>

      {/* Drawer for Mobile */}
      {isMobile && <Drawer userMenu={userMenu} />}

      {/* Spacer below navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;

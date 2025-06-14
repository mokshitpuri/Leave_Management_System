import React, { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { BiLogOut } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useToast,
  Stack,
  Input,
  Box,
} from "@chakra-ui/react";
import DrawerComponent from "./Drawer"; // Import DrawerComponent
import { api } from "../utils/axios/instance";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const toast = useToast();
  const [nameInput, setNameInput] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false); // State for drawer visibility

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

  const downloadReportByName = async () => {
    if (!nameInput.trim() || !nameInput.includes(" ")) {
      toast({
        title: "Error",
        description: "Please enter a valid full name (first and last name).",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const reportUrl = process.env.REACT_APP_REPORT_URL || "http://localhost:3000/report/download-report";

    try {
      const response = await fetch(`${reportUrl}?name=${encodeURIComponent(nameInput.trim())}`, {
        method: "GET",
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "No user found with the provided full name.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }
        throw new Error("Failed to fetch the report.");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${nameInput.trim()}_Leave_Report.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      setNameInput(""); // Clear the input field after download
    } catch (error) {
      console.error("Error downloading the report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to download the report. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
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
            <button
              className="text-white text-2xl"
              onClick={() => setDrawerOpen(true)}
            >
              <CiMenuBurger />
            </button>
            <div>
              {role === "DIRECTOR" ? (
                <Menu>
                  <MenuButton as={Button} colorScheme="blue">
                    Download Report
                  </MenuButton>
                  <MenuList boxShadow="lg" borderRadius="md" p={2} bg="white">
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("casual")}
                    >
                      Casual Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("medical")}
                    >
                      Medical Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("academic")}
                    >
                      Academic Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("earned")}
                    >
                      Earned Leaves
                    </MenuItem>

                    {/* Name Input and Submit Button */}
                    <Box p={4} mt={2} borderTop="1px solid #e2e8f0">
                      <Stack spacing={4}>
                        <Input
                          placeholder="Enter name"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          color="black"
                          _placeholder={{ color: "gray.600" }}
                          borderRadius="md"
                          boxShadow="sm"
                        />
                        <Button
                          colorScheme="blue"
                          borderRadius="md"
                          boxShadow="sm"
                          onClick={() => downloadReportByName()}
                        >
                          Submit
                        </Button>
                      </Stack>
                    </Box>

                    {/* Partition */}
                    <Box borderTop="1px solid #e2e8f0" my={2} />

                    {/* Full Report Button */}
                    <Box p={2}>
                      <Button
                        bg="gray.300"
                        color="black"
                        _hover={{ bg: "gray.400" }}
                        width="100%"
                        fontWeight="bold"
                        textAlign="left"
                        borderRadius="md"
                        boxShadow="sm"
                        onClick={() => downloadReport("")}
                      >
                        Full Report
                      </Button>
                    </Box>
                  </MenuList>
                </Menu>
              ) : (
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
                  <MenuList boxShadow="lg" borderRadius="md" p={2} bg="white">
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("casual")}
                    >
                      Casual Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("medical")}
                    >
                      Medical Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("academic")}
                    >
                      Academic Leaves
                    </MenuItem>
                    <MenuItem
                      style={{ color: "black" }}
                      _hover={{ bg: "gray.100" }}
                      onClick={() => downloadReport("earned")}
                    >
                      Earned Leaves
                    </MenuItem>

                    {/* Name Input and Submit Button */}
                    <Box p={4} mt={2} borderTop="1px solid #e2e8f0">
                      <Stack spacing={4}>
                        <Input
                          placeholder="Enter name"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          color="black"
                          _placeholder={{ color: "gray.600" }}
                          borderRadius="md"
                          boxShadow="sm"
                        />
                        <Button
                          colorScheme="blue"
                          borderRadius="md"
                          boxShadow="sm"
                          onClick={() => downloadReportByName()}
                        >
                          Submit
                        </Button>
                      </Stack>
                    </Box>

                    {/* Partition */}
                    <Box borderTop="1px solid #e2e8f0" my={2} />

                    {/* Full Report Button */}
                    <Box p={2}>
                      <Button
                        bg="gray.300"
                        color="black"
                        _hover={{ bg: "gray.400" }}
                        width="100%"
                        fontWeight="bold"
                        textAlign="left"
                        borderRadius="md"
                        boxShadow="sm"
                        onClick={() => downloadReport("")}
                      >
                        Full Report
                      </Button>
                    </Box>
                  </MenuList>
                </Menu>
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
      <DrawerComponent
        userMenu={userMenu}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Spacer below navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;

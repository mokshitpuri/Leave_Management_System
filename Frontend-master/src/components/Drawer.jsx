import React from "react";
import {
  Drawer as ChakraDrawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  Button,
  Box,
} from "@chakra-ui/react";
import { BiLogOut } from "react-icons/bi";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";

function Drawer({ userMenu, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!userMenu) return null; // Prevents 'undefined' map error

  return (
    <ChakraDrawer placement="left" isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent bg="rgb(43, 66, 100)" color="white">
        <DrawerBody p={0} pt={6}>
          <Box w="full" h="full" p={4}>
            {userMenu.map((item) => (
              <Button
                key={item.path}
                w="full"
                justifyContent="start"
                variant="ghost"
                colorScheme={location.pathname === item.path ? "white" : "whiteAlpha"}
                fontWeight={location.pathname === item.path ? "bold" : "normal"}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                {item.title}
              </Button>
            ))}
          </Box>
        </DrawerBody>
        <DrawerFooter p={0}>
          <Box w="full" display="flex" justifyContent="space-between" alignItems="center" p={4}>
            <Button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              colorScheme="red"
              rightIcon={<BiLogOut />}
              bg="red.500"
              _hover={{ bg: "red.600" }}
            >
              Logout
            </Button>
            <Box bg="white" p={1} borderRadius="md">
              <Button variant="ghost" onClick={onClose}>
                <FaAngleLeft size="1.2em" color="rgb(43, 66, 100)" />
              </Button>
            </Box>
          </Box>
        </DrawerFooter>
      </DrawerContent>
    </ChakraDrawer>
  );
}

export default Drawer;

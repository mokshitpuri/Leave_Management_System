import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  Button,
  Box,
} from "@chakra-ui/react";
import { BiLogOut } from "react-icons/bi";
import { FaAngleLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import DrawerConfig from "./DrawerConfig";
import drawerContext from "../context/DrawerContext";

function DrawerComponent() {
  const { open, setOpen } = React.useContext(drawerContext);
  const navigate = useNavigate();

  return (
    <Drawer placement="left" isOpen={open} onClose={() => setOpen(false)}>
      <DrawerOverlay />
      <DrawerContent bg="blue.700" color="white">
        <DrawerBody p={0} pt={6}>
          <Box w="full" h="full" bg="blue.800" p={4}>
            <DrawerConfig hideHeading />
          </Box>
        </DrawerBody>
        <DrawerFooter p={0}>
          <Box w="full" bg="blue.600" display="flex" justifyContent="space-between" alignItems="center" p={4}>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("userData");
                localStorage.removeItem("username");
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
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <FaAngleLeft size="1.2em" color="blue.700" />
              </Button>
            </Box>
          </Box>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default DrawerComponent;

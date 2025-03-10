import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
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
    <>
      <Drawer placement="left" isOpen={open}>
        <DrawerOverlay />
        <DrawerContent>
          <div className="w-full py-3 px-4 bg-slate-500">
            <p className="text-2xl text-center text-white">Dashboard</p>
          </div>
          <DrawerBody
            style={{
              padding: "0px",
            }}
          >
            <div className="w-full h-full bg-slate-600">
              {/* // this is the main drawer rendering */}
              <DrawerConfig />
            </div>
          </DrawerBody>

          <DrawerFooter
            style={{
              padding: "0px",
            }}
          >
            <div className="flex items-center w-full bg-slate-500 justify-between py-3 px-4">
              <Button
                onClick={() => {
                  navigate("/login");
                }}
                colorScheme="teal"
                rightIcon={<BiLogOut />}
              >
                Logout
              </Button>
              <button
                className="hover:bg-slate-400 px-2 py-2 rounded-md"
                onClick={() => setOpen(false)}
              >
                <FaAngleLeft
                  style={{
                    fontSize: "1.5em",
                    color: "white",
                  }}
                />
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default DrawerComponent;

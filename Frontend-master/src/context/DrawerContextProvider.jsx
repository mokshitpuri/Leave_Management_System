import React from "react";
import drawerContext from "../context/DrawerContext";

function DrawerContextProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <drawerContext.Provider value={{ open, setOpen }}>
      {children}
    </drawerContext.Provider>
  );
}

export default DrawerContextProvider;

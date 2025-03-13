import { createContext, useState } from "react";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

export default DrawerContext;

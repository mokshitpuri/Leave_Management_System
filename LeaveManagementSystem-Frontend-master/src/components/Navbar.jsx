import React from "react";
import { CiMenuBurger } from "react-icons/ci";
import drawerContext from "../context/DrawerContext";
function Navbar() {
  const { setOpen } = React.useContext(drawerContext);
  let username = localStorage.getItem("username");
  return (
    <div className="w-100 h-14 flex static left-0 right-0 bg-slate-100 top-0 justify-between px-3 sm:px-10 items-center ">
      <button
        className="hover:bg-slate-200 px-2 py-2 rounded-lg"
        onClick={() => setOpen(true)}
      >
        <CiMenuBurger size={25} />
      </button>

      <p className="text-sm sm:text-lg  text-black font-semibold">{username}</p>
    </div>
  );
}

export default Navbar;

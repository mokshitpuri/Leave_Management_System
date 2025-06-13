import React, { useState } from "react";
import {
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import { CgLogIn } from "react-icons/cg";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import logo from "../images/login/logo.png";
import bgImage from "../images/login/vector.png";
import avatarIcon from "../images/login/avatar.png";
import { login } from "../utils/functions/authentication";

function Login() {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: login,
    onError: (error) => {
      toast({
        position: "top-right",
        description: error.message, // Display proper error message
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
    onSuccess: () => {
      toast({
        position: "top-right",
        description: "Login successful",
        status: "success",
        duration: 1000,
        isClosable: false,
      });
      setTimeout(() => {
        navigate("/dashboard/home");
      }, 1000);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    if (email === "" || password === "") {
      toast({
        position: "top-right",
        description: "Please fill in all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    mutate({ username: email, password: password });
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px) brightness(0.75)",
        }}
      ></div>

      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative flex flex-col w-[95%] max-w-[480px] p-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl text-center border border-gray-300">
        <img src={logo} alt="Manipal University Logo" className="w-44 self-start mb-6 mix-blend-multiply" />

        <img src={avatarIcon} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto mb-6 bg-gray-700 p-3 shadow-lg" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FormControl>
            <Input
              placeholder="Username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-full p-5 text-xl bg-white bg-opacity-80 text-gray-700 border border-gray-300 shadow-md 
                         placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-400"
            />
          </FormControl>

          <InputGroup>
            <Input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-full p-5 text-xl bg-white bg-opacity-80 text-gray-700 border border-gray-300 shadow-md 
                         placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-400"
            />
            <InputRightElement>
              {show ? (
                <MdOutlineVisibilityOff className="cursor-pointer text-gray-600 text-2xl" onClick={() => setShow(false)} />
              ) : (
                <MdOutlineVisibility className="cursor-pointer text-gray-600 text-2xl" onClick={() => setShow(true)} />
              )}
            </InputRightElement>
          </InputGroup>

          <p className="text-sm text-gray-500 cursor-pointer hover:underline">Forgot Password?</p>

          <Button
            type="submit"
            className="rounded-full p-5 text-xl font-semibold bg-gradient-to-r from-[#E65100] to-[#FF6D00] 
                       text-white hover:from-[#D84315] hover:to-[#F4511E] hover:scale-105 transition-all 
                       duration-300 shadow-lg hover:shadow-xl active:scale-95 w-full"
            isLoading={isLoading}
            rightIcon={<CgLogIn size={24} />}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;

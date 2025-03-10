import React from "react";
import { useState } from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { CgLogIn } from "react-icons/cg";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { login } from "../utils/functions/authentication";
import { useNavigate } from "react-router-dom";

function Login() {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: () => login({ username: email, password: password }),
    onError: (error) => {
      toast({
        position: "top-right",
        description: error.message,
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
    event.preventDefault();
    if (email === "" || password === "") {
      setEmail("");
      setPassword("");
      return;
    } else {
      mutate({ username: email, password: password });
    }
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div
        className="flex w-2/5 h-1/2 min-w-[300px] min-h-[300px] flex-col justify-center items-center bg-slate-50 
      rounded-2xl
      px-10
      py-5
      "
      >
        <form onSubmit={handleSubmit}>
          <FormControl className="flex flex-col items-center w-100 h-100 gap-4">
            <p className="text-4xl text-blue-600">Login</p>

            <Input
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              isRequired={true}
            />

            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                placeholder="Password"
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                value={password}
                isRequired={true}
              />
              <InputRightElement width="3rem">
                {show ? (
                  <MdOutlineVisibilityOff onClick={() => setShow(false)} />
                ) : (
                  <MdOutlineVisibility onClick={() => setShow(true)} />
                )}
              </InputRightElement>
            </InputGroup>

            {isPending ? (
              <Button colorScheme="blue" isLoading rightIcon={<CgLogIn />}>
                Login
              </Button>
            ) : (
              <Button colorScheme="blue" type="submit" rightIcon={<CgLogIn />}>
                Login
              </Button>
            )}
          </FormControl>
        </form>
      </div>
    </div>
  );
}

export default Login;

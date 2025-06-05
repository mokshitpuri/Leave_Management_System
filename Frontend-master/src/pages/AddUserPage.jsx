import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Button,
  useToast,
  Stack,
  Heading,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useMutation } from "@tanstack/react-query";
import { api } from "../utils/axios/instance";

const AddUserPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/admin/addUser", payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setFormData({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "",
      });
    },
    onError: (error) => {
      const errorMsg =
        error?.response?.data?.error || "Failed to add user. Please try again.";
      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password, firstName, lastName, role } = formData;

    if (!username || !password || !firstName || !lastName || !role) {
      toast({
        title: "Error",
        description: "All fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Ensure the role is sent in uppercase
    const payload = {
      ...formData,
      role: role.toUpperCase(),
    };

    mutation.mutate(payload);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt="8"
      p="6"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
    >
      <Heading as="h2" size="lg" textAlign="center" mb="6" color="blue.600">
        Add New User
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              focusBorderColor="blue.500"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                focusBorderColor="blue.500"
              />
              <InputRightElement>
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  size="sm"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              focusBorderColor="blue.500"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              focusBorderColor="blue.500"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Role</FormLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Select role"
              focusBorderColor="blue.500"
            >
              <option value="faculty">Faculty</option>
              <option value="hod">HOD</option>
              <option value="director">Director</option>
            </Select>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={mutation.isLoading}
            size="lg"
          >
            Add User
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AddUserPage;

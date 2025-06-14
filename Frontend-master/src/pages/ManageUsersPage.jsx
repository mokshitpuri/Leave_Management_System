import React, { useEffect, useState } from "react";
import { api } from "../utils/axios/instance"; // Corrected import path
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  IconButton,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/userData");
        const formattedUsers = response.data
          .filter((user) => user.role.toLowerCase() !== "director") // Exclude directors
          .map((user) => ({
            ...user,
            fullName: `${user.firstName} ${user.lastName}`, // Combine firstName and lastName
          }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName)); // Sort alphabetically by fullName
        setUsers(formattedUsers);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch user data.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (username) => {
    try {
      await api.delete(`/admin/deleteUser`, { params: { username } });
      toast({
        title: "User Deleted",
        description: `User '${username}' has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.username !== username)); // Update state instead of reloading
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to delete user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleResetLeaves = async (username) => {
    try {
      await api.post("/admin/reset-leaves", {
        username, // Pass the username to reset leaves for the specific user
        casualLeave: 12,
        earnedLeave: 15,
        medicalLeave: 10,
        academicLeave: 15,
      });
      toast({
        title: "Success",
        description: `Leaves have been reset to default for user '${username}'.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to reset leaves.",
        status: "error",
        duration: 3000,
        isClosable: true,
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
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to reset leaves for all users.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Alert status="error" maxW="400px">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p="6">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="6">
        <Heading as="h1" size="lg" color="blue.600">
          Manage Users
        </Heading>

        {/* Reset All Leaves Button */}
        <Popover>
          <PopoverTrigger>
            <Button colorScheme="red">Reset All Leaves</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold" fontSize="lg">
              Confirm Reset
            </PopoverHeader>
            <PopoverBody>
              <Text fontSize="md" color="black">
                Are you sure you want to reset leaves for <strong>all Users</strong>?
              </Text>
              <Stack direction="row" justifyContent="flex-end" mt="4">
                <Button size="sm" onClick={handleResetAllLeaves} colorScheme="red">
                  Yes, Reset
                </Button>
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>

      <SimpleGrid columns={[1, 2, 3]} spacing="6">
        {users.map((user) => (
          <Box
            key={user.username}
            p="6"
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="lg"
            bg="white"
            position="relative"
          >
            <Stack spacing="2">
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {user.fullName}
              </Text>
              <Text fontSize="md" color="gray.600">
                {user.role}
              </Text>
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" display="inline">
                  Username:&nbsp;
                </Text>
                <Text fontSize="md" color="gray.600" display="inline">
                  {user.username}
                </Text>
              </Box>
            </Stack>
            <Popover>
              <PopoverTrigger>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  top="6"
                  right="6"
                  aria-label={`Delete ${user.username}`}
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Confirm Deletion</PopoverHeader>
                <PopoverBody>
                  Are you sure you want to delete <strong>{user.username}</strong>?
                  <Stack direction="row" justifyContent="flex-end" mt="4">
                    <Button size="sm" onClick={() => handleDelete(user.username)} colorScheme="red">
                      Yes, Delete
                    </Button>
                  </Stack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger>
                <Button
                  colorScheme="red"
                  size="sm"
                  position="absolute"
                  bottom="6"
                  right="6"
                >
                  Reset Leaves
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Confirm Reset</PopoverHeader>
                <PopoverBody>
                  Are you sure you want to reset leaves for <strong>{user.username}</strong>?
                  <Stack direction="row" justifyContent="flex-end" mt="4">
                    <Button size="sm" onClick={() => handleResetLeaves(user.username)} colorScheme="red">
                      Yes, Reset
                    </Button>
                  </Stack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ManageUsersPage;

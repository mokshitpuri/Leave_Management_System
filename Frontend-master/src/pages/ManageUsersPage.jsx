import React, { useEffect, useState } from "react";
import { api } from "../axios/instance";
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
      window.location.reload(); // Reload the page after deletion
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
      <Heading as="h1" size="lg" textAlign="center" mb="6" color="blue.600">
        Manage Users
      </Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing="6">
        {users.map((user, index) => (
          <Box
            key={index}
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
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ManageUsersPage;

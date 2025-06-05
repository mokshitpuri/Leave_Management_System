import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import LeaveComponent from "../components/LeaveComponent";
import { leaveRecord, deleteLeave, clearRejectedLeave } from "../utils/functions/leave";
import { Spinner, Box, Accordion, Text, useToast } from "@chakra-ui/react";

const RecordsPage = () => {
  const toast = useToast();

  // Fetch leave records
  const { data: leaves, isLoading, error, refetch } = useQuery({
    queryKey: ["leaveRecord"],
    queryFn: leaveRecord,
  });

  // Mutation for canceling a leave
  const cancelMutation = useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave request canceled successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel leave request.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  // Mutation for clearing a rejected leave
  const clearMutation = useMutation({
    mutationFn: clearRejectedLeave,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rejected leave cleared successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to clear rejected leave.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const handleCancel = (name) => {
    cancelMutation.mutate(name);
  };

  const handleClear = (name) => {
    clearMutation.mutate(name);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-screen text-xl text-gray-600">
        Error loading leave records.
      </div>
    );
  }

  // Group leaves by status
  const groupedLeaves = leaves.reduce((acc, leave) => {
    if (!acc[leave.status]) acc[leave.status] = [];
    acc[leave.status].push(leave);
    return acc;
  }, {});

  const statuses = [
    { key: "accepted", label: "Accepted Leaves" },
    { key: "awaiting", label: "Awaiting Leaves" },
    { key: "rejected", label: "Rejected Leaves" },
  ];

  return (
    <div className="w-full min-h-screen p-10 bg-gray-100 flex flex-col space-y-10">
      {statuses.map(({ key, label }) => (
        <div key={key}>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            {label}
          </Text>
          {groupedLeaves[key] && groupedLeaves[key].length > 0 ? (
            <Accordion allowMultiple className="w-full max-w-[90vw] mx-auto space-y-6">
              {groupedLeaves[key].map((leave) => (
                <Box key={leave.name} className="shadow-lg rounded-xl overflow-hidden">
                  <LeaveComponent data={leave} onCancel={handleCancel} onClear={handleClear} />
                </Box>
              ))}
            </Accordion>
          ) : (
            <p className="text-gray-500 italic ml-4">No {label.toLowerCase()} found.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecordsPage;

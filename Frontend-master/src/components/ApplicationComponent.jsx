import React, { useState } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Textarea,
  Button,
  useToast,
  Text,
} from "@chakra-ui/react";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ApplicationComponent = ({ data }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload) => {
      return api.get(`/leave/updateStatus?status=${payload.status}&name=${data.name}&reason=${payload.reason || ""}`);
    },
  });

  if (mutation.isSuccess) {
    toast({
      title: "Success",
      description: "Leave status updated",
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top-right",
    });

    setTimeout(() => {
      navigate(0);
    }, 1500);
  }

  if (mutation.isError) {
    toast({
      title: "Failed",
      description: "Error updating leave status",
      status: "error",
      duration: 1500,
      isClosable: true,
      position: "top-right",
    });
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError(true);
      return;
    }
    setError(false);
    mutation.mutate({ status: "rejected", reason: rejectReason });
  };

  return (
    <AccordionItem className="border rounded-xl shadow-md overflow-hidden">
      <AccordionButton className="flex justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
        <Box flex="1" textAlign="left" className="text-lg font-semibold text-gray-800">
          {data.username} - <span className="text-gray-500">{data.type}</span>
        </Box>
        <AccordionIcon />
      </AccordionButton>

      <AccordionPanel className="p-5 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Request Message:</strong> {data.reqMessage}
          </p>
          <p>
            <strong>From:</strong> {new Date(data.from).toLocaleDateString()}
          </p>
          <p>
            <strong>To:</strong> {new Date(data.to).toLocaleDateString()}
          </p>
          <p>
            <strong>Type:</strong> {data.type}
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowRejectReason(!showRejectReason)}
            colorScheme="red"
          >
            Reject
          </Button>
          <Button
            onClick={() => mutation.mutate({ status: "accepted" })}
            colorScheme="green"
          >
            Accept
          </Button>
        </div>

        {showRejectReason && (
          <div className="mt-4">
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setError(false); // Remove error message on input change
              }}
              className="mb-2"
            />
            {error && <Text color="red.500" fontSize="sm">Rejection reason is required!</Text>}
            <Button colorScheme="red" onClick={handleReject} className="mt-2">
              Confirm Rejection
            </Button>
          </div>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationComponent;

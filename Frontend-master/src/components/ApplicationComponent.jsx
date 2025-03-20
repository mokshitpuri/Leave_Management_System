import React, { useState } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Tag,
  Textarea,
  Button,
  useToast,
} from "@chakra-ui/react";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ApplicationComponent = ({ data }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
          <Tag
            onClick={() => setShowRejectReason(!showRejectReason)}
            colorScheme="red"
            className="py-2 px-6 text-sm cursor-pointer"
          >
            Reject
          </Tag>
          <Tag
            onClick={() => mutation.mutate({ status: "accepted" })}
            colorScheme="green"
            className="py-2 px-6 text-sm cursor-pointer"
          >
            Accept
          </Tag>
        </div>

        {showRejectReason && (
          <div className="mt-4">
            <Textarea
              placeholder="Provide a reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mb-2"
            />
            <Button
              colorScheme="red"
              onClick={() => mutation.mutate({ status: "rejected", reason: rejectReason })}
            >
              Confirm Rejection
            </Button>
          </div>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationComponent;

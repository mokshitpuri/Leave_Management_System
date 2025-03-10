import React from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Tag,
  useToast,
} from "@chakra-ui/react";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ApplicationComponent = (data) => {
  const toast = useToast();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (payload) => {
      return api.get(
        `/leave/updateStatus?status=${payload}&name=${data.data.name}`
      );
    },
  });

  if (mutation.isSuccess) {
    toast({
      title: "Success",
      description: "Leave status updated",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });

    setTimeout(() => {
      navigate(0);
    }, 1000);
  }

  if (mutation.isError) {
    toast({
      title: "Failed",
      description: "failed updating leave status",
      status: "danger",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });
  }
  return (
    <AccordionItem className="border rounded-md">
      <AccordionButton className="flex flex-row justify-between px-2 py-1">
        <p className="text-sm">{data.data.username}</p>
        <div className="flex flex-row ">
          <AccordionIcon />
        </div>
      </AccordionButton>
      <AccordionPanel>
        <div className="w-full py-3 flex flex-col sm:flex-row">
          <div className="w-full h-full px-2 flex-col">
            <p>Name :- {data.data.name}</p>
            <p>Req message :- {data.data.reqMessage}</p>
            <p>from :- {data.data.from}</p>
            <p>to :- {data.data.to}</p>
            <p>type :- {data.data.type}</p>
          </div>

          <div className="px-4 pt-4 flex justify-center items-center flex-row gap-3">
            <Tag
              onClick={() => mutation.mutate("rejected")}
              colorScheme="red"
              className="text-s py-3 px-7 hover:cursor-pointer"
            >
              Reject
            </Tag>
            <Tag
              onClick={() => mutation.mutate("accepted")}
              colorScheme="green"
              className="text-s py-3 px-7 hover:cursor-pointer"
            >
              Accept
            </Tag>
          </div>
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationComponent;

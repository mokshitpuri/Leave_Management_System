import React from "react";
import {
  Button,
  Input,
  Textarea,
  FormLabel,
  InputLeftAddon,
  InputGroup,
  useToast,
  position,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormik } from "formik";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";

const CasualLeave = () => {
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: (payload) => {
      return api.post("/leave/apply", payload);
    },
  });

  const handleSubmit = async (values, actions) => {
    const { name, message, date, type } = values;
    const payload = {
      name,
      reqMessage: message,
      to: date,
      from: date,
      type,
      days: 1,
    };
    await mutation.mutate(payload);
    if (mutation.isSuccess) {
      toast({
        title: "Success",
        description: "leave created successfully",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });

      setTimeout(() => {
        actions.resetForm();
      }, 1000);
    }

    if (mutation.isError) {
      console.log(mutation.error);
      toast({
        title: "failed",
        description: "failure",
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      date: new Date(),
      message: "",
      type: "casual",
    },
    onSubmit: handleSubmit,
  });

  const handleDateChange = (date) => {
    formik.setFieldValue("date", date);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col px-2 py-5 justify-center gap-4"
      >
        <div>
          <FormLabel> Leave Name</FormLabel>
          <Input
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="Enter unique name"
            id="name"
            isRequired
          />
        </div>

        <div>
          <FormLabel>Date</FormLabel>
          <DatePicker
            id="date"
            className="border rounded-md w-full p-3"
            selected={formik.values.date}
            onChange={handleDateChange}
            minDate={new Date()}
            popperPlacement="top-end"
            isRequired
          />
        </div>

        <div>
          <FormLabel>Message</FormLabel>
          <Textarea
            id="message"
            value={formik.values.message}
            onChange={formik.handleChange}
            placeholder="Enter the reason for leave"
            isRequired
          />
        </div>
        <div>
          <FormLabel>Emergency Contact</FormLabel>
          <InputGroup>
            <InputLeftAddon>+91</InputLeftAddon>
            <Input placeholder="Enter phone number" />
          </InputGroup>
        </div>

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default CasualLeave;

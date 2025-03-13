import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  FormLabel,
  useToast,
  Stack,
  Flex,
  Box,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useFormik } from "formik";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";

const EarnedLeave = () => {
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/leave/apply", payload),
  });

  const handleSubmit = async (values, actions) => {
    if (values.reqMessage.split(/\s+/).length > 50) {
      toast({
        title: "Error",
        description: "Reason must be within 50 words",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    const payload = {
      ...values,
      from: values.from.format(),
      to: values.to.format(),
    };

    await mutation.mutate(payload);

    if (mutation.isSuccess) {
      toast({
        title: "Success",
        description: "Leave created successfully",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });

      setTimeout(() => actions.resetForm(), 1000);
    }

    if (mutation.isError) {
      toast({
        title: "Failed",
        description: "Something went wrong",
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
      from: startDate,
      to: endDate,
      reqMessage: "",
      type: "earned",
      days: 0,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (startDate && endDate) {
      formik.setFieldValue("days", endDate.diff(startDate, "days") + 1);
    }
  }, [startDate, endDate]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={4}>
        <Box>
          <FormLabel fontWeight="bold">Leave Name</FormLabel>
          <Input
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            isRequired
            placeholder="Enter unique name"
          />
        </Box>

        <Box>
          <FormLabel fontWeight="bold">Days</FormLabel>
          <Input id="days" name="days" value={formik.values.days} isReadOnly />
        </Box>

        <Flex justify="space-between">
          <Box>
            <FormLabel fontWeight="bold">From</FormLabel>
            <DatePicker
              className="border rounded-md p-2"
              selected={formik.values.from.toDate()}
              onChange={(date) => {
                setStartDate(moment(date));
                formik.setFieldValue("from", moment(date));
              }}
              minDate={new Date()}
            />
          </Box>
          <Box>
            <FormLabel fontWeight="bold">To</FormLabel>
            <DatePicker
              className="border rounded-md p-2"
              selected={formik.values.to.toDate()}
              onChange={(date) => {
                setEndDate(moment(date));
                formik.setFieldValue("to", moment(date));
              }}
              minDate={formik.values.from.toDate()}
              maxDate={moment(formik.values.from)
                .add(
                  Math.min(
                    3,
                    JSON.parse(localStorage.getItem("userData"))?.earnedLeave || 0
                  ),
                  "days"
                )
                .toDate()}
            />
          </Box>
        </Flex>

        <Box>
          <FormLabel fontWeight="bold">Reason</FormLabel>
          <Textarea
            id="reqMessage"
            name="reqMessage"
            isRequired
            value={formik.values.reqMessage}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= 50) {
                formik.setFieldValue("reqMessage", e.target.value);
              }
            }}
            placeholder="Enter the reason for leave (Max 50 words)"
          />
        </Box>

        <Button colorScheme="blue" type="submit" isLoading={formik.isSubmitting}>
          Submit Request
        </Button>
      </Stack>
    </form>
  );
};

export default EarnedLeave;

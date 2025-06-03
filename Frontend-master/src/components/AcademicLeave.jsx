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

const AcademicLeave = () => {
  const today = moment();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const toast = useToast();

  const maxAcademicLeave =
    JSON.parse(localStorage.getItem("userData"))?.academicLeave || 4;

  const mutation = useMutation({
    mutationFn: (payload) => api.post("/leave/apply", payload),
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.msg || "Something went wrong";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Leave created successfully",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
      setTimeout(() => formik.resetForm(), 1000);
    },
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
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      from: startDate,
      to: endDate,
      reqMessage: "",
      type: "academic",
      days: 1,
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
                .add(Math.min(maxAcademicLeave, 4), "days")
                .toDate()}
            />
          </Box>
        </Flex>

        <Box>
          <FormLabel fontWeight="bold">Reason </FormLabel>
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

export default AcademicLeave;

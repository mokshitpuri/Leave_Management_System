import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
  FormLabel,
  InputLeftAddon,
  InputGroup,
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
import { useNavigate } from "react-router-dom";

const CasualLeave = () => {
  const navigate = useNavigate(); // Add useNavigate hook
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [maxLeaveDays, setMaxLeaveDays] = useState(12);
  const toast = useToast();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const remainingLeaves = userData?.CasualLeave || 12;
    setMaxLeaveDays(Math.min(12, remainingLeaves));
  }, []);

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
      navigate("/dashboard/home");
    },
  });

  const handleSubmit = async (values, actions) => {
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
      message: "",
      type: "casual",
      days: 0,
      phone: "",
    },
    validate: (values) => {
      const errors = {};
      if (!/^\d{10}$/.test(values.phone)) {
        errors.phone = "Phone number must be exactly 10 digits";
      }
      const wordCount = values.message.trim().split(/\s+/).length;
      if (wordCount > 100) {
        errors.message = "Message cannot exceed 100 words";
      }
      return errors;
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
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="Enter unique name"
            isRequired
          />
        </Box>

        <Box>
          <FormLabel fontWeight="bold">Days</FormLabel>
          <Input id="days" value={formik.values.days} isReadOnly />
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
                .add(maxLeaveDays - 1, "days")
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
              if (words.length <= 100) {
                formik.setFieldValue("reqMessage", e.target.value);
              }
            }}
            placeholder="Enter the reason for leave (Max 100 words)"
          />
        </Box>

        <Box>
          <FormLabel fontWeight="bold">Emergency Contact</FormLabel>
          <InputGroup>
            <InputLeftAddon>+91</InputLeftAddon>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formik.values.phone}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "");
                if (onlyNums.length <= 10) {
                  formik.setFieldValue("phone", onlyNums);
                }
              }}
              onBlur={formik.handleBlur}
              maxLength="10"
              isInvalid={formik.touched.phone && !!formik.errors.phone}
            />
          </InputGroup>
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-red-500 text-sm">{formik.errors.phone}</p>
          )}
        </Box>

        <Button colorScheme="blue" type="submit" isLoading={formik.isSubmitting}>
          Submit Request
        </Button>
      </Stack>
    </form>
  );
};

export default CasualLeave;
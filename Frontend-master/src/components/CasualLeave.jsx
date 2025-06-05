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
  Text,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useFormik } from "formik";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const CasualLeave = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const toast = useToast();

  const maxCasualLeave =
    JSON.parse(localStorage.getItem("userData"))?.casualLeave || 12;

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
      navigate("/dashboard/home"); // Redirect to homepage on success
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      from: startDate,
      to: endDate,
      reqMessage: "",
      type: "casual",
      days: 1,
      emergencyContact: "",
    },
    onSubmit: async (values) => {
      try {
        // Fetch existing leaves
        const response = await api.get("/leave/getLeaves");
        const existingLeaves = response.data.body;

        // Check for overlapping dates
        const overlappingLeave = existingLeaves.find(
          (leave) =>
            (leave.status === "accepted" || leave.status === "awaiting") &&
            (moment(values.from).isBetween(leave.from, leave.to, null, "[]") ||
              moment(values.to).isBetween(leave.from, leave.to, null, "[]") ||
              moment(leave.from).isBetween(values.from, values.to, null, "[]") ||
              moment(leave.to).isBetween(values.from, values.to, null, "[]") ||
              moment(values.from).isSame(leave.from, "day") || // Single-day overlap
              moment(values.to).isSame(leave.to, "day"))
        );
        if (overlappingLeave) {
          toast({
            title: "Error",
            description: "Dates overlap with an existing leave.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }

        // Check for duplicate leave name
        const duplicateName = existingLeaves.find(
          (leave) => leave.name === values.name
        );
        if (duplicateName) {
          toast({
            title: "Error",
            description: "Leave name must be unique.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          return;
        }

        // Submit leave if validations pass
        const payload = {
          ...values,
          from: values.from.format(),
          to: values.to.format(),
        };
        await mutation.mutate(payload);
      } catch (error) {
        console.error("Error validating leave:", error.message);
        toast({
          title: "Error",
          description: "Failed to validate leave. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    },
  });

  useEffect(() => {
    if (startDate) {
      setEndDate(startDate); // Default "To" date to the "From" date
      formik.setFieldValue("to", startDate);
    }
  }, [startDate]);

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
            placeholder="Enter unique name"
          />
          {formik.errors.name && formik.touched.name && (
            <Text color="red.500" fontSize="sm">
              Leave name is mandatory.
            </Text>
          )}
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
              maxDate={moment().add(maxCasualLeave, "days").toDate()} // Restrict to available casual leaves
              dateFormat="dd/MM/yyyy"
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
                .add(maxCasualLeave, "days")
                .toDate()} // Restrict to available casual leaves
              dateFormat="dd/MM/yyyy"
            />
          </Box>
        </Flex>

        <Box>
          <FormLabel fontWeight="bold">Reason</FormLabel>
          <Textarea
            id="reqMessage"
            name="reqMessage"
            value={formik.values.reqMessage}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= 50) {
                formik.setFieldValue("reqMessage", e.target.value);
              } else {
                toast({
                  title: "Warning",
                  description: "Reason cannot exceed 50 words.",
                  status: "warning",
                  duration: 3000,
                  isClosable: true,
                  position: "top-right",
                });
              }
            }}
            placeholder="Enter the reason for leave (Max 50 words)"
          />
          {formik.errors.reqMessage && formik.touched.reqMessage && (
            <Text color="red.500" fontSize="sm">
              Reason is mandatory.
            </Text>
          )}
        </Box>

        <Box>
          <FormLabel fontWeight="bold">Emergency Contact Number</FormLabel>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            type="tel"
            value={formik.values.emergencyContact || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                formik.setFieldValue("emergencyContact", value);
              }
            }}
            placeholder="Enter emergency contact number (Max 10 digits)"
          />
          {formik.values.emergencyContact.length > 10 && (
            <Text color="red.500" fontSize="sm">
              Phone number cannot exceed 10 digits.
            </Text>
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
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

const MedicalLeave = () => {
  const navigate = useNavigate();
  const today = moment();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const toast = useToast();

  const maxMedicalLeave =
    JSON.parse(localStorage.getItem("userData"))?.medicalLeave || 10;

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
      type: "medical",
      days: 1,
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
              moment(values.from).isSame(leave.from, "day") && // Added missing &&
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
            containerStyle: { maxWidth: "90vw" },
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
      formik.setFieldValue("days", endDate.diff(startDate, "days") + 1); // Correct calculation
    }
  }, [startDate, endDate]);

  return (
    <form onSubmit={formik.handleSubmit} className="w-full max-w-full">
      <Stack spacing={4}>
        <Box>
          <FormLabel fontWeight="bold">Leave Name</FormLabel>
          <Input
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            placeholder="Enter unique name"
            className="w-full"
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

        <Flex justify="space-between" flexWrap="wrap" gap={4}>
          <Box className="w-full sm:w-auto">
            <FormLabel fontWeight="bold">From</FormLabel>
            <DatePicker
              className="border rounded-md p-2 w-full"
              selected={formik.values.from.toDate()}
              onChange={(date) => {
                setStartDate(moment(date));
                formik.setFieldValue("from", moment(date));
              }}
              minDate={moment().subtract(100, "years").toDate()} // Allow any backdate applications
              maxDate={moment().toDate()} // Disallow applications ahead of the present date
              dateFormat="dd/MM/yyyy"
              showMonthArrow // Enable arrow buttons for month navigation
              showYearArrow // Enable arrow buttons for year navigation
            />
          </Box>
          <Box className="w-full sm:w-auto">
            <FormLabel fontWeight="bold">To</FormLabel>
            <DatePicker
              className="border rounded-md p-2 w-full"
              selected={formik.values.to.toDate()}
              onChange={(date) => {
                setEndDate(moment(date));
                formik.setFieldValue("to", moment(date));
              }}
              minDate={formik.values.from.toDate()} // Ensure "To" date is after "From" date
              maxDate={moment(formik.values.from)
                .add(maxMedicalLeave, "days")
                .toDate()} // Restrict to available medical leaves
              dateFormat="dd/MM/yyyy"
              showMonthArrow // Enable arrow buttons for month navigation
              showYearArrow // Enable arrow buttons for year navigation
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
              if (words.length <= 100) {
                formik.setFieldValue("reqMessage", e.target.value);
              } else {
                toast({
                  title: "Warning",
                  description: "Reason cannot exceed 100 words.",
                  status: "warning",
                  duration: 3000,
                  isClosable: true,
                  position: "top-right",
                  containerStyle: { maxWidth: "90vw" },
                });
              }
            }}
            placeholder="Enter the reason for leave (Max 100 words)"
          />
          {formik.errors.reqMessage && formik.touched.reqMessage && (
            <Text color="red.500" fontSize="sm">
              Reason is mandatory.
            </Text>
          )}
        </Box>

        <Box>
          <Button
            as="a"
            href={`mailto:director@jaipur.manipal.edu?subject=Medical%20Leave%20Prescription%20for%20${formik.values.from.format(
              "DD/MM/YYYY"
            )}%20to%20${formik.values.to.format("DD/MM/YYYY")}`}
            bg="white" // White background
            color="blue.500" // Current blue color as text
            _hover={{ bg: "gray.100" }} // Light gray background on hover
            border="1px solid"
            borderColor="blue.500" // Blue border
            variant="outline"
          >
            Mail Prescription / Reports
          </Button>
        </Box>

        <Button colorScheme="blue" type="submit" isLoading={formik.isSubmitting} className="w-full">
          Submit Request
        </Button>
      </Stack>
    </form>
  );
};

export default MedicalLeave;

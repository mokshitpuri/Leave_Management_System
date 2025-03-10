import React, { useState, useEffect } from "react";
import { Button, Input, Textarea, FormLabel, useToast } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useFormik } from "formik";
import { api } from "../utils/axios/instance";
import { useMutation } from "@tanstack/react-query";

const AcademicLeave = () => {
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (payload) => {
      return api.post("/leave/apply", payload);
    },
  });

  const handleSubmit = async (values, actions) => {
    const { name, reqMessage, from, to, type, days } = values;

    // Format the moment objects into date strings
    const fromDateString = from.format();
    const toDateString = to.format();

    const payload = {
      name,
      reqMessage,
      to: toDateString,
      from: fromDateString,
      type,
      days,
    };
    console.log(payload);
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
      from: startDate,
      to: endDate,
      reqMessage: "",
      type: "academic",
      days: 0,
    },
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    handleCalculateDays();
  }, [startDate, endDate]);

  const handleCalculateDays = () => {
    if (startDate && endDate) {
      const diffInDays = endDate.diff(startDate, "days") + 1;
      formik.setFieldValue("days", diffInDays);
    } else {
      formik.setFieldValue("days", 0);
    }
  };
  const handleStartDateChange = (date) => {
    setStartDate(moment(date));
    formik.setFieldValue("from", moment(date));
  };
  const handleEndDateChange = (date) => {
    setEndDate(moment(date));
    formik.setFieldValue("to", moment(date));
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="w-full flex flex-col px-2 py-5 justify-center gap-4"
    >
      <div>
        <FormLabel>Name</FormLabel>
        <Input
          id="name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          isRequired
          placeholder="Enter unique name"
        />
      </div>
      <div>
        <FormLabel>Days</FormLabel>
        <Input
          id="days"
          name="days"
          value={formik.values.days}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isReadOnly
        />
      </div>
      <div className="flex flex-row justify-between">
        <div>
          <FormLabel>From</FormLabel>
          <DatePicker
            className="border rounded-md"
            selected={formik.values.from.toDate()}
            onChange={(date) => handleStartDateChange(date)}
            popperPlacement="top-end"
            minDate={new Date()}
          />
        </div>
        <div>
          <FormLabel>To</FormLabel>
          <DatePicker
            className="border rounded-md"
            selected={formik.values.to.toDate()}
            onChange={(date) => handleEndDateChange(date)}
            popperPlacement="top-end"
            minDate={formik.values.from.toDate()}
            maxDate={moment(formik.values.from).add(9, "days").toDate()}
          />
        </div>
      </div>
      <div>
        <FormLabel>Academic Reason</FormLabel>
        <Textarea
          id="reqMessage"
          name="reqMessage"
          isRequired
          value={formik.values.reqMessage}
          onChange={formik.handleChange}
          placeholder="Enter the reason for leave"
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default AcademicLeave;

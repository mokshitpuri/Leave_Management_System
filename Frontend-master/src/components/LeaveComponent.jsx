import React, { useEffect, useState } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Box,
  Tag,
  Flex,
  Text,
} from "@chakra-ui/react";

const LeaveComponent = ({ data }) => {
  const colorMap = {
    awaiting: "yellow",
    accepted: "green",
    rejected: "red",
  };

  const stepsFaculty = [
    { title: "Faculty", description: "Leave submitted" },
    { title: "HOD", description: "Pending approval" },
    { title: "Director", description: "Final approval" },
  ];

  const stepsHod = [
    { title: "HOD", description: "Leave submitted" },
    { title: "Director", description: "Final approval" },
  ];

  const role = localStorage.getItem("role");

  const findIndex = (stage) => {
    if (stage === "FACULTY") return 0;
    if (stage === "HOD") return role === "HOD" ? 0 : 1;
    if (stage === "DIRECTOR") return role === "HOD" ? 1 : 2;
    return 0;
  };

  const findSteps = () => (role === "HOD" ? stepsHod : stepsFaculty);

  const [steps, setSteps] = useState(findSteps());

  useEffect(() => {
    setSteps(findSteps());
  }, [role]);

  return (
    <AccordionItem className="border rounded-xl shadow-md bg-white">
      <AccordionButton className="flex justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-all duration-200 rounded-t-lg">
        <Box className="flex flex-col">
          <Text className="text-lg font-semibold text-gray-800">{data.name}</Text>
          <Text className="text-sm text-gray-500">{data.type}</Text>
        </Box>
        <Flex align="center" gap={4}>
          <Tag colorScheme={colorMap[data.status]} className="text-sm px-4 py-1 font-medium">
            {data.status.toUpperCase()}
          </Tag>
          <AccordionIcon />
        </Flex>
      </AccordionButton>

      <AccordionPanel className="p-5 bg-white">
        <Stepper size="sm" orientation="vertical" index={findIndex(data.stage)}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>

              <Box flexShrink="0" className="ml-3">
                <StepTitle className="text-md font-semibold text-gray-800">{step.title}</StepTitle>
                <StepDescription className="text-sm text-gray-600">{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default LeaveComponent;

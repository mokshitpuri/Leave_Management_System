import React, { useEffect, useState } from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Tag,
  Flex,
  Text,
  Button,
  useToast,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepIcon,
  StepNumber,
} from "@chakra-ui/react";

const LeaveComponent = ({ data, onCancel, onClear }) => {
  const toast = useToast();
  const colorMap = {
    awaiting: "yellow",
    accepted: "green",
    rejected: "red",
  };

  const stepsFaculty = [
    { title: "Faculty" },
    { title: "HOD" },
    { title: "Director", description: "Final approval" },
  ];

  const stepsHod = [
    { title: "HOD" },
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

  const handleCancel = () => {
    const threeDaysBeforeStartDate = new Date(data.from);
    threeDaysBeforeStartDate.setDate(threeDaysBeforeStartDate.getDate() - 3);

    if (new Date() > threeDaysBeforeStartDate) {
      toast({
        title: "Warning",
        description: "Leave cancellation window is 3 days prior.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      onCancel(data.name);
    }
  };

  const handleClear = () => {
    onClear(data.name);
  };

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
        <Box className="space-y-4">
          <Box className="p-4 border rounded-md bg-gray-50">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="bold" color="gray.600">
                From:
              </Text>
              <Text color="gray.800">{new Date(data.from).toLocaleDateString()}</Text>
            </Flex>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="bold" color="gray.600">
                To:
              </Text>
              <Text color="gray.800">{new Date(data.to).toLocaleDateString()}</Text>
            </Flex>
            <Box>
              <Text fontWeight="bold" color="gray.600" mb={1}>
                Reason:
              </Text>
              <Text color="gray.800" whiteSpace="pre-wrap">
                {data.reqMessage}
              </Text>
            </Box>
          </Box>
        </Box>

        <Stepper size="sm" orientation="vertical" index={findIndex(data.stage)} mt={4}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>

              <Box flexShrink="0" className="ml-3">
                <StepTitle className="text-md font-semibold text-gray-800">{step.title}</StepTitle>
                {step.description && (
                  <StepDescription className="text-sm text-gray-600">{step.description}</StepDescription>
                )}
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {data.status === "accepted" && (
          <Flex justify="flex-end" mt={4}>
            <Button colorScheme="red" size="sm" onClick={handleCancel}>
              Cancel Request
            </Button>
          </Flex>
        )}

        {data.status === "rejected" && (
          <>
            {/* Show rejection reason above the Clear Request button */}
            {data.rejMessage && (
              <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="red.50" borderColor="red.300">
                <Text fontWeight="bold" color="red.600" mb={1}>
                  Rejection Reason:
                </Text>
                <Text color="red.700" whiteSpace="pre-wrap">
                  {data.rejMessage}
                </Text>
              </Box>
            )}

            <Flex justify="flex-end" mt={4}>
              <Button colorScheme="red" size="sm" onClick={handleClear}>
                Clear Request
              </Button>
            </Flex>
          </>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default LeaveComponent;

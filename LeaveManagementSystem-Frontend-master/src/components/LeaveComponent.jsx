import React, { useEffect } from "react";
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
} from "@chakra-ui/react";

const LeaveComponent = ({ data }) => {
  const colorMap = {
    awaiting: "teal",
    accepted: "green",
    rejected: "red",
  };

  const stepsFaculty = [
    { title: "FACULTY", description: "" },
    { title: "HOD", description: "" },
    { title: "DIRECTOR", description: "" },
  ];

  const stepsHod = [
    { title: "HOD", description: "Leave submitted" },
    { title: "DIRECTOR", description: "Leave Accepted" },
  ];

  const role = localStorage.getItem("role");

  const findIndex = (data) => {
    if (data === "FACULTY") return 1;
    if (data === "HOD")
      if (role === "HOD") return 1;
      else return 2;
    if (data === "DIRECTOR")
      if (role === "HOD") return 2;
      else return 3;
  };

  const findSteps = () => {
    if (role === "FACULTY") return stepsFaculty;
    if (role === "HOD") return stepsHod;
  };

  useEffect(() => {
    setSteps(findSteps());
  }, []);

  let [steps, setSteps] = React.useState(findSteps());

  return (
    <AccordionItem className="border rounded-md">
      <AccordionButton className="flex flex-row justify-between px-2 py-1">
        <p className="text-sm ">{data.name}</p>
        <div className="flex flex-row ">
          <div className="px-4">
            <Tag colorScheme={colorMap[data.status]} className="text-sm px-7">
              {data.status}
            </Tag>
          </div>
          <AccordionIcon />
        </div>
      </AccordionButton>
      <AccordionPanel pb={4}>
        {steps && steps.length > 0 && (
          <Stepper
            size="sm"
            orientation="vertical"
            index={findIndex(data.stage)}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default LeaveComponent;

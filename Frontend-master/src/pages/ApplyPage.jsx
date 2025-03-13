import React from "react";
import { 
  Radio, RadioGroup, Stack, Box, Heading, Card, Divider, Flex 
} from "@chakra-ui/react";
import CasualLeave from "../components/CasualLeave";
import MedicalLeave from "../components/MedicalLeave";
import EarnedLeave from "../components/EarnedLeave";
import AcademicLeave from "../components/AcademicLeave";

const ApplyPage = () => {
  const [value, setValue] = React.useState("1");

  return (
    <Box className="min-h-screen flex flex-col items-center bg-gray-100 py-8 px-4">
      {/* Header Section */}
      <Card className="shadow-lg rounded-2xl px-8 py-6 w-full max-w-2xl text-center bg-white">
        <Heading size="md" color="blue.600" pb={4} fontWeight="semibold">
          Select Type of Leave
        </Heading>
        <Divider mb={4} />
        <RadioGroup onChange={setValue} value={value}>
          <Flex wrap="wrap" justify="center" gap={4}>
            <Radio value="1" colorScheme="blue" size="lg">Casual</Radio>
            <Radio value="2" colorScheme="blue" size="lg">Academic</Radio>
            <Radio value="3" colorScheme="blue" size="lg">Earned</Radio>
            <Radio value="4" colorScheme="blue" size="lg">Medical</Radio>
          </Flex>
        </RadioGroup>
      </Card>

      {/* Leave Form Section */}
      <Box className="w-full max-w-3xl mt-6 bg-white shadow-md rounded-2xl p-6">
        {value === "1" && <CasualLeave />}
        {value === "2" && <AcademicLeave />}
        {value === "3" && <EarnedLeave />}
        {value === "4" && <MedicalLeave />}
      </Box>
    </Box>
  );
};

export default ApplyPage;

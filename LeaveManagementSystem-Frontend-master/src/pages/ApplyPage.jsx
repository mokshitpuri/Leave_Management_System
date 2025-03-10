import React from "react";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import CasualLeave from "../components/CasualLeave";
import MedicalLeave from "../components/MedicalLeave";
import EarnedLeave from "../components/EarnedLeave";
import AcademicLeave from "../components/AcademicLeave";
const ApplyPage = () => {
  const [value, setValue] = React.useState("1");
  return (
    <div className="w-full h-full">
      <div className="flex flex-col bg-slate-300 w-full text-xs items-center sm:text-md justify-center py-4 px-4 flex-wrap">
        <p className="text-lg pb-4">Select Type of Leave</p>
        <RadioGroup onChange={setValue} value={value}>
          <Stack direction="row">
            <Radio value="1">Casual</Radio>
            <Radio value="2">Academic</Radio>
            <Radio value="3">Earned</Radio>
            <Radio value="4">Medical</Radio>
          </Stack>
        </RadioGroup>
      </div>
      <div className="w-full h-full">
        {value === "1" && <CasualLeave />}
        {value === "2" && <AcademicLeave />}
        {value === "3" && <EarnedLeave />}
        {value === "4" && <MedicalLeave />}
      </div>
    </div>
  );
};

export default ApplyPage;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loggedInUser } from "../utils/functions/user";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Spinner,
  Image,
} from "@chakra-ui/react";

const Home = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: loggedInUser,
    queryKey: ["loggedInUser"],
  });
  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </div>
    );
  } else {
    return (
      <div className="h-full w-full">
        <div className="p-3  text-sm sm:text-lg sm:m-3 flex flex-row justify-between">
          <div>
            <p>
              <p className="text-lg sm:text-2xl text-blue-500">Username</p>{" "}
              {data.username}
            </p>
            <p>
              <p className="text-lg sm:text-2xl text-blue-500">Role</p>{" "}
              {data.role}
            </p>
          </div>
          <Image
            src="https://bit.ly/dan-abramov"
            boxSize="100px"
            alt="profile photo"
          />
        </div>

        <div className="p-3 m-3 border">
          <TableContainer>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr color="black">
                  <Th>Quantity</Th>
                  <Th color="purple">Casual</Th>
                  <Th color="blue">Academic</Th>
                  <Th color="red">Earned</Th>
                  <Th color="dark">Medical</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td color="red">Total Allowed</Td>
                  <Td>12</Td>
                  <Td>15</Td>
                  <Td>15</Td>
                  <Td>10</Td>
                </Tr>
                <Tr>
                  <Td color="green">Balance Leaves</Td>
                  <Td>{data.casualLeave}</Td>
                  <Td>{data.academicLeave}</Td>
                  <Td>{data.earnedLeave}</Td>
                  <Td>{data.medicalLeave}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  }
};

export default Home;

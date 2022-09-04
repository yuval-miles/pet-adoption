import { Alert, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import axiosClient from "../../utils/axiosClient";
import LinearProgress from "@mui/material/LinearProgress";
import { AxiosError } from "axios";
import PersonIcon from "@mui/icons-material/Person";
import { DateTime } from "luxon";

interface InquiriesType {
  createdAt: string;
  id: string;
  letter: string;
  reason: string;
  user: {
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    email: string;
  } | null;
  userId: string | null;
}

const InquiriesComp = () => {
  const { data, isLoading, isSuccess, isError, error } = useQuery<
    { message: string; response: InquiriesType[] },
    AxiosError
  >(
    ["inquiries"],
    async () => (await axiosClient.get("/admin/getinquiries")).data,
    {
      refetchOnWindowFocus: false,
    }
  );
  console.log(data);
  if (isLoading) return <LinearProgress />;
  return (
    <Paper
      sx={{
        width: "100%",
        height: "68vh",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        overflowY: "auto",
      }}
    >
      {isSuccess ? (
        <>
          {data.response.map((el) => (
            <Paper key={el.id} sx={{ padding: "20px", width: "75%" }}>
              <Stack gap={3}>
                <Stack direction={"row"} justifyContent={"space-between"}>
                  <Stack gap={2}>
                    <Stack direction={"row"} gap={2} alignItems={"center"}>
                      <PersonIcon sx={{ fontSize: "2rem" }} />
                      <Typography variant="h4">
                        {el.user
                          ? el.user.firstName
                            ? `${el.user.firstName} ${el.user.lastName}`
                            : el.user.name
                          : "Deleted user"}
                      </Typography>
                    </Stack>
                    <Typography>
                      Email:{" "}
                      {el.user
                        ? el.user.email
                          ? el.user.email
                          : "Unassigned"
                        : "Deleted user"}
                    </Typography>
                    <Typography>
                      Phone Number:{" "}
                      {el.user
                        ? el.user.phoneNumber
                          ? el.user.phoneNumber
                          : "Unassigned"
                        : "Deleted user"}
                    </Typography>
                  </Stack>
                  <Stack gap={2} alignItems={"flex-end"}>
                    <Typography variant="h5">
                      User Id: {el.userId ? el.userId : "Deleted User"}
                    </Typography>
                    <Typography>
                      Created At: {DateTime.fromISO(el.createdAt).toHTTP()}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Typography>Reason: {el.reason}</Typography>
                  <Typography>Inquiry: {el.letter}</Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </>
      ) : isError ? (
        <>
          <Alert severity="error">{error.message}</Alert>
        </>
      ) : (
        <></>
      )}
    </Paper>
  );
};

export default InquiriesComp;

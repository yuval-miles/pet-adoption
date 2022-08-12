import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import type { UserResponse } from "../types/userTypes";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Navigation from "../Layout/Navigation";
import axiosClient from "../utils/axiosClient";
import { AxiosError } from "axios";

const Home: NextPage = () => {
  const { data, status } = useSession();
  const {
    data: userData,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useQuery<{ message: string; response: UserResponse }, AxiosError>(
    ["userData"],
    async () => {
      if (data) return (await axiosClient.get(`/users/${data.id}`)).data;
      else throw new Error("Session data is undefined");
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (status === "authenticated") refetch();
  }, [status, refetch]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 120px)",
        }}
      >
        {status === "authenticated" && isSuccess ? (
          <Typography variant="h5">
            Welcome back{" "}
            {userData.response.firstName && userData.response.lastName
              ? `${userData.response.firstName} ${userData.response.lastName}`
              : userData.response.name}
          </Typography>
        ) : status === "unauthenticated" ? (
          <Stack gap={5}>
            <Typography variant="h2">Welcome to Adopt a pet 👋</Typography>
            <Typography variant="h5">
              A app that connects people looking to foster and adopt pets
            </Typography>
          </Stack>
        ) : isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <Alert severity="error">
            {
              <Stack alignItems={"center"}>
                <Typography>
                  Ohh no something went wrong please try again later
                </Typography>
                {error && (
                  <Typography>
                    {`Error status: ${
                      error.response?.status
                    },Error message: ${JSON.stringify(error.response?.data)}`}
                  </Typography>
                )}
              </Stack>
            }
          </Alert>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
};

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default Home;

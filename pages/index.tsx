import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { NextPage } from "next";
import Navigation from "../Layout/Navigation";
import useUserInfo from "../hooks/useUserInfo";

const Home: NextPage = () => {
  const { isError, isLoading, isSuccess, userData, error, status } =
    useUserInfo();
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
        {status === "authenticated" && isSuccess && userData ? (
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

import {
  Alert,
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosClient from "../../utils/axiosClient";

interface StatsType {
  totalUsers: { createdAt: string }[];
  totalPets: number;
  petsStatus: { _count: { status: number }; status: string }[];
  petLogs: {
    createdAt: string;
    id: string;
    petId: string;
    status: string;
    userId: string | null;
  };
}

const StatsComp = () => {
  const { data, isError, isLoading, error } = useQuery<
    {
      message: string;
      response: StatsType;
    },
    AxiosError
  >(["stats"], async () => (await axiosClient.get("/admin/getstats")).data, {
    refetchOnWindowFocus: false,
  });
  console.log(data);
  if (isLoading)
    return (
      <>
        <LinearProgress />
      </>
    );
  console.log(data?.response);
  if (isError) return <Alert severity="error">{error.message}</Alert>;
  return (
    <>
      <Box
        sx={{
          border: "1px solid grey",
          borderRadius: "5px",
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          gap: "10px",
          padding: "10px",
          flexWrap: "wrap",
        }}
      >
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "5px",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Typography variant="h4">Total Users: </Typography>
          <Typography variant="h4">
            {data.response.totalUsers.length}
          </Typography>
        </Paper>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "5px",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Typography variant="h4">Total Pets: </Typography>
          <Typography variant="h4">{data.response.totalPets}</Typography>
        </Paper>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "5px",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Typography variant="h4">Adopted Pets: </Typography>
          <Typography variant="h4">
            {data.response.petsStatus[0]?._count.status
              ? data.response.petsStatus[0]?._count.status
              : 0}
          </Typography>
        </Paper>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "5px",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Typography variant="h4">Fostered Pets: </Typography>
          <Typography variant="h4">
            {data.response.petsStatus[1]?._count.status
              ? data.response.petsStatus[1]?._count.status
              : 0}
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default StatsComp;

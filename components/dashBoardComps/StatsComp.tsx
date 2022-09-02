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
import { useEffect, useRef, useState } from "react";
import axiosClient from "../../utils/axiosClient";

interface PetLogsType {
  createdAt: string;
  id: string;
  petId: string;
  status: string;
  userId: string | null;
}
interface UserType {
  createdAt: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}
interface StatsType {
  totalUsers: UserType[];
  totalPets: number;
  petsStatus: { _count: { status: number }; status: string }[];
  petLogs: PetLogsType[];
}

const StatsComp = () => {
  const [feed, setFeed] = useState<Array<PetLogsType | UserType>>([]);
  const addedPets = useRef<{ [key: string]: boolean }>({});
  const { data, isError, isLoading, error, isSuccess } = useQuery<
    {
      message: string;
      response: StatsType;
    },
    AxiosError
  >(["stats"], async () => (await axiosClient.get("/admin/getstats")).data, {
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (isSuccess) {
      const feedArr: Array<PetLogsType | UserType> = [
        ...data.response.petLogs,
        ...data.response.totalUsers,
      ];
      feedArr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setFeed(feedArr);
    }
  }, [isSuccess]);
  if (isLoading)
    return (
      <>
        <LinearProgress />
      </>
    );
  if (isError) return <Alert severity="error">{error.message}</Alert>;
  return (
    <>
      <Stack>
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
        <Paper>
          {feed.map((el, idx) => {
            if ("status" in el && !addedPets.current.hasOwnProperty(el.petId)) {
              addedPets.current[el.petId] = true;
              el.status = "Pet Added";
            }
            return (
              <Paper key={el.createdAt + idx}>
                {"status" in el && <Typography>{el.status}</Typography>}
              </Paper>
            );
          })}
        </Paper>
      </Stack>
    </>
  );
};

export default StatsComp;

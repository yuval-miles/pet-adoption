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
import { DateTime } from "luxon";
import PetsIcon from "@mui/icons-material/Pets";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface PetLogsType {
  createdAt: string;
  id: string;
  petId: string;
  status: string;
  pet: { name: string };
  user: { name: string; firstName: string; lastName: string };
  userId: string | null;
}
interface UserType {
  createdAt: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  id: string;
}
interface StatsType {
  totalUsers: UserType[];
  totalPets: number;
  petsStatus: { _count: { status: number }; status: string }[];
  petLogs: PetLogsType[];
}

const StatsComp = () => {
  const [feed, setFeed] = useState<Array<PetLogsType | UserType>>([]);
  const addedPets: { [key: string]: boolean } = {};
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
      data.response.petLogs.forEach((el) => {
        if (!addedPets.hasOwnProperty(el.petId)) {
          addedPets[el.petId] = true;
          el.status = "Added";
        }
      });
      const feedArr: Array<PetLogsType | UserType> = [
        ...data.response.petLogs,
        ...data.response.totalUsers,
      ];
      feedArr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFeed(feedArr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Stack gap={3}>
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
              {data.response.petsStatus.find((el) => el.status === "Adopted")
                ?._count.status
                ? data.response.petsStatus.find((el) => el.status === "Adopted")
                    ?._count.status
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
              {data.response.petsStatus.find((el) => el.status === "Fostered")
                ?._count.status
                ? data.response.petsStatus.find(
                    (el) => el.status === "Fostered"
                  )?._count.status
                : 0}
            </Typography>
          </Paper>
        </Box>
        <Paper sx={{ padding: "10px", maxHeight: "480px", overflowY: "auto" }}>
          <Stack gap={1}>
            {feed.map((el, idx) => (
              <Paper key={el.createdAt + idx} sx={{ padding: "10px" }}>
                {"status" in el && (
                  <Stack gap={1}>
                    <Stack direction="row" gap={2}>
                      <PetsIcon
                        color={
                          el.status === "Available"
                            ? "error"
                            : el.status === "Added"
                            ? "success"
                            : el.status === "Adopted"
                            ? "primary"
                            : "warning"
                        }
                      />
                      <Typography>
                        {el.pet.name} was{" "}
                        {el.status === "Available" ? "Returned" : el.status} at{" "}
                        {DateTime.fromISO(el.createdAt).toHTTP()}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography>Pet id: {el.id}</Typography>
                      {el.userId ? (
                        <>
                          <Typography>
                            {el.status} by{" "}
                            {el.user.firstName
                              ? `${el.user.firstName} ${el.user.lastName}`
                              : el.user.name}
                          </Typography>
                          <Typography>userId: {el.userId}</Typography>
                        </>
                      ) : (
                        <></>
                      )}
                    </Stack>
                  </Stack>
                )}
                {"firstName" in el && (
                  <Stack gap={1}>
                    <Stack direction={"row"} gap={2}>
                      <PersonAddIcon color="primary" />
                      <Typography>
                        {el.firstName
                          ? `${el.firstName} ${el.lastName}`
                          : el.name}{" "}
                        was created at {DateTime.fromISO(el.createdAt).toHTTP()}
                      </Typography>
                    </Stack>
                    <Typography>userId: {el.id}</Typography>
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};

export default StatsComp;

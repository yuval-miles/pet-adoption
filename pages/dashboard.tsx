import {
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Navigation from "../Layout/Navigation";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import PetsIcon from "@mui/icons-material/Pets";
import UsersTable from "../components/dashBoardComps/UsersTable";
import PetsTable from "../components/dashBoardComps/PetsTable";
import StatsComp from "../components/dashBoardComps/StatsComp";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";

const Dashboard: NextPage = () => {
  const [page, setPage] = useState<"users" | "pets" | "stats">("users");
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const {} = useQuery(["test"], async () => axiosClient.get("/admin/getchats"));
  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "users" | "pets" | "stats"
  ) => {
    if (newFilter !== null) {
      setPage(newFilter);
    }
  };
  return (
    <>
      <Stack sx={{ width: "100%" }}>
        <Stack gap={2}>
          <Typography variant="h2">Dashboard: </Typography>
          <ToggleButtonGroup
            value={page}
            exclusive
            onChange={handleToggle}
            aria-label="filter"
            color={"primary"}
          >
            <ToggleButton value="users" aria-label="left aligned">
              <Stack direction={"row"} gap={2}>
                <Typography>Users</Typography>
                <AccountBoxIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="pets" aria-label="left aligned">
              <Stack direction={"row"} gap={2}>
                <Typography>Pets</Typography>
                <PetsIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="stats" aria-label="left aligned">
              <Stack direction={"row"} gap={2}>
                <Typography>Statistics</Typography>
                <TimelineIcon />
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
          {page === "users" ? (
            <>
              <UsersTable />
            </>
          ) : page === "pets" ? (
            <>
              <PetsTable />
            </>
          ) : (
            <>
              <StatsComp />
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <Navigation>{page}</Navigation>;
};

export default Dashboard;

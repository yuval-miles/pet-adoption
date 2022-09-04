import {
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import Navigation from "../Layout/Navigation";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import PetsIcon from "@mui/icons-material/Pets";
import UsersTable from "../components/dashBoardComps/UsersTable";
import PetsTable from "../components/dashBoardComps/PetsTable";
import StatsComp from "../components/dashBoardComps/StatsComp";
import ChatIcon from "@mui/icons-material/Chat";
import ChatsComp from "../components/dashBoardComps/UserChats/ChatsComp";
import MailIcon from "@mui/icons-material/Mail";
import InquiriesComp from "../components/dashBoardComps/InquiriesComp";
import type { Page } from "../types/types";

const Dashboard: Page = () => {
  const [page, setPage] = useState<
    "users" | "pets" | "stats" | "chats" | "inquiries"
  >("users");
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "users" | "pets" | "stats" | "chats" | "inquiries"
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
            <ToggleButton value="users" aria-label="users">
              <Stack direction={"row"} gap={2}>
                <Typography>Users</Typography>
                <AccountBoxIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="pets" aria-label="pets">
              <Stack direction={"row"} gap={2}>
                <Typography>Pets</Typography>
                <PetsIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="stats" aria-label="stats">
              <Stack direction={"row"} gap={2}>
                <Typography>Statistics</Typography>
                <TimelineIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="inquiries" aria-label="inquiries">
              <Stack direction={"row"} gap={2}>
                <Typography>Inquiries</Typography>
                <MailIcon />
              </Stack>
            </ToggleButton>
            <ToggleButton value="chats" aria-label="chats">
              <Stack direction={"row"} gap={2}>
                <Typography>Chats</Typography>
                <ChatIcon />
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
          ) : page === "stats" ? (
            <>
              <StatsComp />
            </>
          ) : page === "chats" ? (
            <>
              <ChatsComp />
            </>
          ) : (
            <>
              <InquiriesComp />
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

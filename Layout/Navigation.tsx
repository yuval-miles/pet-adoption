import { styled } from "@mui/material/styles";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import AppbarComp from "./AppbarComp";
import DrawerComp from "./DrawerComp";
import React from "react";
import LoginModal from "../components/logincomps/LoginModal";
import MessageComp from "./MessageComp";
import { useSession } from "next-auth/react";
import useChat from "../hooks/useChat";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Navigation = ({ children }: { children: React.ReactNode }) => {
  useChat();
  const { data, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <LoginModal openModal={openModal} handleCloseModal={handleCloseModal} />
      <AppbarComp
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        handleOpenModal={handleOpenModal}
      />
      <DrawerComp open={open} handleDrawerClose={handleDrawerClose} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
      {status === "authenticated" && data.role === "user" && (
        <MessageComp userId={data.id as string} />
      )}
    </Box>
  );
};

export default Navigation;

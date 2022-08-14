import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import AppbarComp from "./AppbarComp";
import DrawerComp from "./DrawerComp";
import React from "react";
import LoginModal from "../components/logincomps/LoginModal";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Navigation = ({ children }: { children: React.ReactNode }) => {
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
    </Box>
  );
};

export default Navigation;

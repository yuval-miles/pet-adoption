import { Button, IconButton, Toolbar } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";
import React from "react";
import { Stack } from "@mui/system";
import { useSession, signOut } from "next-auth/react";

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  backgroundColor: "#fafafa",
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppbarComp = ({
  open,
  handleDrawerOpen,
  handleOpenModal,
}: {
  open: boolean;
  handleDrawerOpen: () => void;
  handleOpenModal: () => void;
}) => {
  const { status, data } = useSession();
  return (
    <AppBar position="fixed" open={open}>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon sx={{ color: "black" }} />
          </IconButton>
        </Toolbar>
        <Button
          variant="contained"
          sx={{ margin: "15px" }}
          onClick={
            status === "unauthenticated"
              ? handleOpenModal
              : () => signOut({ redirect: false })
          }
        >
          {status === "unauthenticated" ? "Sign-Up/Login" : "Sign Out"}
        </Button>
      </Stack>
    </AppBar>
  );
};

export default AppbarComp;

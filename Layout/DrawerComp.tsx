import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  NavList,
  unAuthNavList,
  authNavList,
  Routes,
  adminNavList,
} from "./navLists/index";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerComp = ({
  open,
  handleDrawerClose,
}: {
  open: boolean;
  handleDrawerClose: () => void;
}) => {
  const { status, data } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [navigation, setNavigation] = useState<NavList>(unAuthNavList);
  useEffect(() => {
    if (status === "authenticated") {
      if (data.role === "user") setNavigation(authNavList);
      else if (data.role === "admin") setNavigation(adminNavList);
    } else if (status === "unauthenticated") setNavigation(unAuthNavList);
  }, [status, data?.role]);
  const handleClick = (route: Routes) => () => {
    if (
      route === "/profile/[userId]" &&
      data &&
      router.pathname !== "/profile/[userId]"
    )
      router.push(route.replace("[userId]", data.id as string));
    else if (route === "/" && router.pathname !== "/") {
      router.push("/");
    } else if (
      route === "/addpet" &&
      data &&
      router.pathname !== "/addpet" &&
      data.role === "admin"
    )
      router.push("/addpet");
    else if (route === "/search" && router.pathname !== "/search")
      router.push("/search");
    else if (route === "/mypets" && router.pathname !== "/mypets")
      router.push("/mypets");
    else if (route === "/dashboard" && router.pathname !== "/dashboard")
      router.push("/dashboard");
    else if (route === "/contactus" && router.pathname !== "/contactus")
      router.push("/contactus");
  };
  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <List>
        {navigation.map((el) => (
          <ListItem key={el.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              onClick={handleClick(el.route)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: router.pathname === el.route ? "#0288d1" : "grey",
                }}
              >
                {el.icon}
              </ListItemIcon>
              <ListItemText primary={el.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default DrawerComp;

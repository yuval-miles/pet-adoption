import SearchIcon from "@mui/icons-material/Search";
import PetsIcon from "@mui/icons-material/Pets";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";

export type Routes =
  | "/search"
  | "/mypets"
  | "/profile/[userId]"
  | "/"
  | "/dashboard"
  | "/addpet";

export type NavList = Array<{
  text: string;
  icon: JSX.Element;
  route: Routes;
}>;

export const unAuthNavList: NavList = [
  { text: "Home", icon: <HomeIcon color="inherit" />, route: "/" },
  {
    text: "Search Pets",
    icon: <SearchIcon color="inherit" />,
    route: "/search",
  },
];

export const authNavList: NavList = [
  { text: "Home", icon: <HomeIcon color="inherit" />, route: "/" },
  {
    text: "Search Pets",
    icon: <SearchIcon color="inherit" />,
    route: "/search",
  },
  { text: "My Pets", icon: <PetsIcon color="inherit" />, route: "/mypets" },
  {
    text: "Settings",
    icon: <SettingsIcon color="inherit" />,
    route: "/profile/[userId]",
  },
];

export const adminNavList: NavList = [
  { text: "Home", icon: <HomeIcon color="inherit" />, route: "/" },
  {
    text: "Search Pets",
    icon: <SearchIcon color="inherit" />,
    route: "/search",
  },
  { text: "My Pets", icon: <PetsIcon color="inherit" />, route: "/mypets" },
  { text: "Add Pets", icon: <AddIcon color="inherit" />, route: "/addpet" },
  {
    text: "Dashboard",
    icon: <DashboardIcon color="inherit" />,
    route: "/dashboard",
  },
  {
    text: "Settings",
    icon: <SettingsIcon color="inherit" />,
    route: "/profile/[userId]",
  },
];

import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Navigation from "../Navigation/Navigation";
import c from "./MainLayout.module.scss"
import BottomNavigation, { type BottomNavItem } from "../Navigation/BottomNavigation";
import SearchIcon from "../Icons/SearchIcon";
import PlayIcon from "../Icons/PlayIcon";
import BagIcon from "../Icons/BagIcon";
import AccountIcon from "../Icons/AccountIcon";

const items: [BottomNavItem, BottomNavItem, BottomNavItem, BottomNavItem] = [
  {
    key: "search",
    icon: <SearchIcon />,
    onClick: () => console.log("Search"),
  },
  {
    key: "fav",
    icon: <PlayIcon />,
    onClick: () => console.log("Video"),
  },
  {
    key: "profile",
    icon: <AccountIcon />,
    onClick: () => useNavigate(),
  },
  {
    key: "profile",
    icon: <BagIcon />,
    onClick: () => console.log("Profile"),
  },
];

export default function MainLayout() {
  const nav = useNavigate();
  return (
    <>
      <div className={c.m}>
        <Navigation />
        <BottomNavigation
          items={items}
          bottomOffset={12}
          rounded={18}
          visibleOnDesktop={true}
        />
        <main className="app-container">
          <Outlet />
          <Footer />
        </main>
      </div>
    </>
  );
}

// MainLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Navigation from "../Navigation/Navigation";
import c from "./MainLayout.module.scss";
import BottomNavigation, { type BottomNavItem } from "../Navigation/BottomNavigation";
import SearchIcon from "../Icons/SearchIcon";
import PlayIcon from "../Icons/PlayIcon";
import BagIcon from "../Icons/BagIcon";
import AccountIcon from "../Icons/AccountIcon";
import { useMemo } from "react";

export default function MainLayout() {
  const navigate = useNavigate();

  const items = useMemo<[BottomNavItem, BottomNavItem, BottomNavItem, BottomNavItem]>(() => [
    {
      key: "search",
      icon: <SearchIcon />,
      onClick: () => navigate("/search"),
    },
    {
      key: "video",
      icon: <PlayIcon />,
      onClick: () => navigate("/video"),
    },
    {
      key: "profile",
      icon: <AccountIcon />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "cart",
      icon: <BagIcon />,
      onClick: () => navigate("/cart"),
    },
  ], [navigate]); // ключи уникальные!

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

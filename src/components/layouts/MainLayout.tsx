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
import { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import CounterBadge from "../Common/CounterBadge/CounterBadge";
import MobileSearch from "../Header/MobileSearch";
import HomeIcon from "../Icons/HomeIcon";

export default function MainLayout() {
  const navigate = useNavigate();
  const { lines } = useCart();

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const items = useMemo<BottomNavItem[]>(() => [
    {
      key: "home",
      icon: <HomeIcon />,
      onClick: () => navigate("/"),
    },
    {
      key: "search",
      icon: <SearchIcon />,
      onClick: () => navigate("/s"),
    },
    {
      key: "video",
      icon: <PlayIcon />,
      onClick: () => navigate("/videos?sort=trending"),
    },
    {
      key: "profile",
      icon: <AccountIcon />,
      onClick: () => navigate("/account"),
    },
    {
      key: "cart",
      icon: <BagIcon />,
      renderAfterIcon: (
        <CounterBadge count={cartCount} title={`In cart: ${cartCount}`} />
      ),
      onClick: () => navigate("/checkout"),
    },
  ], [navigate]); // ключи уникальные!

  return (
    <>
      <div className={c.m}>
        <Navigation hideOnMobile />
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

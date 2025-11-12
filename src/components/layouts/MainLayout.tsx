// MainLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
import HomeIcon from "../Icons/HomeIcon";
import GridIcon from "../Icons/GridIcon";

const API_ORIGIN = new URL(import.meta.env.VITE_API_BASE_URL).origin;
const abs = (u?: string | null) =>
  !u ? "" : (u.startsWith("http") ? u : `${API_ORIGIN}${u}`);

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { lines } = useCart();

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  // аватар: абсолютный URL + cache-buster по updatedAt
  const avatarSrc = useMemo(() => {
    if (!user?.avatarUrl) return "";
    const base = abs(user.avatarUrl);
    const stamp = encodeURIComponent(user.updatedAt || String(Date.now()));
    return `${base}?t=${stamp}`;
  }, [user?.avatarUrl, user?.updatedAt]);

  // если картинка не загрузилась — откатимся к иконке
  const [avatarBroken, setAvatarBroken] = useState(false);

  const items = useMemo<BottomNavItem[]>(() => [
    {
      key: "home",
      icon: <HomeIcon />,
      onClick: () => navigate("/"),
    },
    {
      key: "catalog",
      icon: <GridIcon />,
      onClick: () => navigate("/c"),
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
      icon: (
        isAuthenticated && avatarSrc && !avatarBroken ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            width={24}
            height={24}
            loading="lazy"
            decoding="async"
            onError={() => setAvatarBroken(true)}
          />
        ) : isAuthenticated ? (
          <div
            className={c.placeholder}
            aria-hidden
          ></div>
        ) : (
          <AccountIcon />
        )
      ),
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
        <Outlet />
      </div>
    </>
  );
}

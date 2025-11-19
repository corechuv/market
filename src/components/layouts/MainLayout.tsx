// src/components/layouts/MainLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navigation from "../Navigation/Navigation";
import c from "./MainLayout.module.scss";
import BottomNavigation, {
  type BottomNavItem,
} from "../Navigation/BottomNavigation";
import SearchIcon from "../Icons/SearchIcon";
import PlayIcon from "../Icons/PlayIcon";
import BagIcon from "../Icons/BagIcon";
import AccountIcon from "../Icons/AccountIcon";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import CounterBadge from "../Common/CounterBadge/CounterBadge";
import HomeIcon from "../Icons/HomeIcon";
import HamburgerIcon from "../Icons/HamburgerIcon";
import { buildAvatarSrc } from "../../utils/avatar";

// helpers для плейсхолдера-инициалов
const nameFromUser = (u?: any) => {
  const f = (u?.firstName || "").trim();
  const l = (u?.lastName || "").trim();
  const full = `${f} ${l}`.trim();
  return full || u?.username || u?.email || "User";
};

const initialsFromName = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { lines } = useCart();

  const username = useMemo(() => {
    const uname = (user as any)?.username;
    return uname ? String(uname).trim().toLowerCase() : "";
  }, [user]);

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const displayName = useMemo(() => nameFromUser(user), [user]);
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  // абсолютный URL + cache-buster
  const avatarSrc = useMemo(
    () => buildAvatarSrc(user?.avatarUrl, user?.updatedAt),
    [user?.avatarUrl, user?.updatedAt]
  );

  const [avatarBroken, setAvatarBroken] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  // при смене src — заново ждём загрузку и снимаем флаг поломки
  useEffect(() => {
    setAvatarBroken(false);
    setAvatarLoaded(false);
  }, [avatarSrc]);

  const items = useMemo<BottomNavItem[]>(
    () => [
      { key: "home", icon: <HomeIcon />, onClick: () => navigate("/") },
      {
        key: "catalog",
        icon: <HamburgerIcon />,
        onClick: () => navigate("/c"),
      },
      { key: "search", icon: <SearchIcon />, onClick: () => navigate("/s") },
      {
        key: "video",
        icon: <PlayIcon />,
        onClick: () => navigate("/videos?sort=trending"),
      },
      {
        key: "profile",
        icon: isAuthenticated ? (
          avatarSrc && !avatarBroken ? (
            <div
              className={c.avatarWrap}
              title={displayName}
              data-loaded={avatarLoaded || undefined}
            >
              <img
                key={avatarSrc}
                src={avatarSrc}
                alt="Avatar"
                decoding="async"
                loading="eager"
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarBroken(true)}
              />
            </div>
          ) : (
            <div className={c.placeholder} title={displayName}>
              {initials}
            </div>
          )
        ) : (
          <AccountIcon />
        ),
        onClick: () => {
          if (!isAuthenticated) {
            navigate("/auth");
          } else if (username) {
            navigate(`/u/${username}/videos`); // публичный профиль
          } else {
            navigate("/account");
          }
        },
      },
      {
        key: "cart",
        icon: <BagIcon />,
        renderAfterIcon: (
          <CounterBadge count={cartCount} title={`In cart: ${cartCount}`} />
        ),
        onClick: () => navigate("/checkout"),
      },
    ],
    [
      navigate,
      isAuthenticated,
      username,
      avatarSrc,
      avatarBroken,
      avatarLoaded,
      displayName,
      initials,
      cartCount,
    ]
  );

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

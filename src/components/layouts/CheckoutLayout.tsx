// src/components/lyouts/CheckoutLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import c from "./CheckoutLayout.module.scss";
import Footer from "../Footer/Footer";
import Header from "../Checkout/Header";

export default function CheckoutLayout() {
  const location = useLocation();

  const isSuccessPage = location.pathname === "/checkout/success";

  // Для success-страницы показываем только содержимое Outlet
  if (isSuccessPage) {
    return <Outlet />;
  }

  // Обычный checkout с шапкой и футером
  return (
    <div className={c.m}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

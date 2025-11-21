// src/components/lyouts/CheckoutLayout.tsx
import { Outlet } from "react-router-dom";
import c from "./CheckoutLayout.module.scss"
import Footer from "../Footer/Footer";
import Header from "../Checkout/Header";

export default function CheckoutLayout() {
  return (
    <div className={c.m}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

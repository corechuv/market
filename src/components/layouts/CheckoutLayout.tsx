// src/components/lyouts/CheckoutLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import c from "./CheckoutLayout.module.scss"
import Footer from "../Footer/Footer";
import Header from "../Checkout/Header";
import { useCart } from "../../context/CartContext";
import { useMemo } from "react";
import Page from "../UI/Page/Page";

export default function CheckoutLayout() {
  const navigate = useNavigate();
  const { lines } = useCart();

  const itemsCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  if (itemsCount === 0) {
    return (
      <Page>
        <div className={c.cart}>
          <h1 className={c.cart__empty}>
            Cart is empty
          </h1>
          <div className={c.cart__actions}>
            <a onClick={() => navigate("/")}>
              Home
            </a>
            <a onClick={() => navigate(-1)}>
              Return to shopping
            </a>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <div className={c.m}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

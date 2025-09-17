import "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import WishlistPage from "./pages/Wishlist/WishlistPage";
import SearchPage from "./pages/Search/SearchPage";
import ProductsPage from "./pages/Product/ProductsPage";
import ProductPage from "./pages/Product/ProductPage";
import CategoryPage from "./pages/Category/CategoryPage";
import AccountPage from "./pages/Account/AccountPage";
import AuthPage from "./pages/Auth/AuthPage";
import "./styles/scrollbar.module.scss";

import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import CheckoutLayout from "./components/layouts/CheckoutLayout";

import CheckoutPage from "./pages/Checkout/CheckoutPage";

import CookieConsent from "./components/CookieConsent/CookieConsent";
import AddressEdit from "./pages/Account/AddressEdit";
import OrderDetails from "./pages/Account/OrderDetails";
import ReturnRequestPage from "./pages/Account/ReturnRequest";
import ReturnDetailsPage from "./pages/Account/ReturnDetails";

export default function App() {

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/category/*" element={<CategoryPage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/addresses/new" element={<AddressEdit />} />
          <Route path="/account/addresses/:id" element={<AddressEdit />} />
          <Route path="/account/orders/:id" element={<OrderDetails />} />
          <Route path="/account/returns/new" element={<ReturnRequestPage />} />
          <Route path="/account/returns/:id" element={<ReturnDetailsPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          {/* /auth и любые /auth/* без Header/Footer */}
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        <Route element={<CheckoutLayout />}>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>

      <CookieConsent policyUrl="/privacy" brandName="Dashedo" />
    </>
  );
}

import "react";
import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import SearchPage from "./pages/Search/SearchPage";
import ProductsPage from "./pages/Product/ProductsPage";
import ProductPage from "./pages/Product/ProductPage";
import CategoryPage from "./pages/Category/CategoryPage";
import AccountPage from "./pages/Account/AccountPage";

import AuthPage from "./pages/Auth/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AuthScreen() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthPage
      onLogin={async ({ email, password, remember }) => {
        await login({ email, password, remember });
        navigate("/account");
      }}
      onRegister={async ({ firstName, lastName, email, password }) => {
        await register({ firstName, lastName, email, password });
        navigate("/account");
      }}
    />
  );
}

import "./styles/scrollbar.module.scss";

import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import CheckoutLayout from "./components/layouts/CheckoutLayout";

import CheckoutPage from "./pages/Checkout/CheckoutPage";

import CookieConsent from "./components/CookieConsent/CookieConsent";
import OrderDetails from "./pages/Account/OrderDetails";
import ReturnRequestPage from "./pages/Account/ReturnRequest";
import ReturnDetailsPage from "./pages/Account/ReturnDetailsPage";
import NotFound from "./pages/NotFound/NotFound";
import ReturnsListPage from "./pages/Account/ReturnListPage";
import AddressEditOrAddPage from "./pages/Account/AddressEditOrAddPage";
import ChangePasswordPage from "./pages/Account/ChangePasswordPage";
import VerifyEmailPage from "./pages/Account/VerifyEmailPage";
import ReelsPage from "./pages/ReelsPage";
import MyVideosPage from "./pages/Account/MyVideosPage";
import MobileSearchPage from "./pages/Search/MobileSearchPage";

export default function App() {

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/search" element={<SearchPage />} />
            <Route path="/s" element={<MobileSearchPage />} />

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/category/*" element={<CategoryPage />} />

            <Route path="/videos" element={<ReelsPage />} />
            <Route path="/videos/:id" element={<ReelsPage />} />

            <Route path="/videos/me" element={<MyVideosPage />} />

            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/addresses/new" element={<AddressEditOrAddPage />} />
            <Route path="/account/addresses/:id" element={<AddressEditOrAddPage />} />
            <Route path="/account/order/:id" element={<OrderDetails />} />
            <Route path="/account/orders/:id" element={<OrderDetails />} />
            <Route path="/account/returns" element={<ReturnsListPage />} />
            <Route path="/account/returns/new" element={<ReturnRequestPage />} />
            <Route path="/account/returns/:id" element={<ReturnDetailsPage />} />
            <Route path="/account/settings/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} /> {/* ← алиас на случай старых писем */}
            <Route path="/account/settings/change-password" element={<ChangePasswordPage />} />
            <Route path="/reset-password" element={<ChangePasswordPage />} /> {/* ← алиас */}
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>

          <Route element={<CheckoutLayout />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>
        </Routes>

        <CookieConsent policyUrl="/privacy" brandName="Dashedo" />
      </AuthProvider>
    </>
  );
}

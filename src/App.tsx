import "react";
import "./App.css";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import Home from "./pages/Home/Home";
import SearchPage from "./pages/Search/SearchPage";
import ProductsPage from "./pages/Product/ProductsPage";
import ProductPage from "./pages/Product/ProductPage";
import CategoryPage from "./pages/Category/CategoryPage";
import AccountPage from "./pages/Account/AccountPage";

import AuthPage from "./pages/Auth/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

type AuthMode = "login" | "register";

function AuthScreen() {
  const { login, register, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams<{ tab?: string }>();

  const mode: AuthMode = tab === "register" ? "register" : "login";

  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get("next") ?? undefined;

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode !== mode) {
      // сохраняем ?next=... при переключении табов
      navigate(`/auth/${nextMode}${location.search}`, { replace: true });
    }
  };

  if (!loading && isAuthenticated && user) {
    if (next) {
      return <Navigate to={next} replace />;
    }
    const username = user.username ?? user.user?.username;
    if (username) {
      return <Navigate to={`/u/${username}`} replace />;
    }
  }

  const redirectAfterAuth = (me: any) => {
    if (next) {
      navigate(next, { replace: true });
      return;
    }
    const username = me?.username ?? me?.user?.username;
    if (username) {
      navigate(`/u/${username}`, { replace: true });
    }
  };

  return (
    <AuthPage
      mode={mode}
      onModeChange={handleModeChange}
      onLogin={async ({ email, password, remember }) => {
        const me = await login({ email, password, remember });
        redirectAfterAuth(me);
      }}
      onRegister={async ({ firstName, lastName, email, password }) => {
        const me = await register({ firstName, lastName, email, password });
        redirectAfterAuth(me);
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
import ProfileEditPage from "./pages/Account/Profile/ProfileEditPage";
import AddressesPage from "./pages/Account/Address/AddressesPage";
import OrdersPage from "./pages/Account/Order/OrdersPage";
import SecurityPage from "./pages/Account/Security/SecurityPage";
import OrderDetails from "./pages/Account/Order/OrderDetails";
import ReturnRequestPage from "./pages/Account/Order/Return/ReturnRequest";
import ReturnDetailsPage from "./pages/Account/Order/Return/ReturnDetailsPage";
import NotFound from "./pages/NotFound/NotFound";
import ReturnsListPage from "./pages/Account/Order/Return/ReturnListPage";
import AddressEditOrAddPage from "./pages/Account/Address/AddressEditOrAddPage";
import ChangePasswordPage from "./pages/Account/Security/ChangePasswordPage";
import VerifyEmailPage from "./pages/Account/Security/VerifyEmailPage";
import ReelsPage from "./pages/ReelsPage";
import MyVideosPage from "./pages/Account/MyVideosPage";
import MobileSearchPage from "./pages/Search/MobileSearchPage";
import MobileCatalogPage from "./pages/Catalog/MobileCatalogPage";
{/* Legal */ }
import TermsPage from "./pages/Legal/TermsPage";
import PrivacyPolicyPage from "./pages/Legal/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/Legal/CookiePolicyPage";
import ImprintPage from "./pages/Legal/ImprintPage";
import SitemapPage from "./pages/Legal/SitemapPage";
{/* Help */ }
import ContactPage from "./pages/Help/ContactPage";
import FAQPage from "./pages/Help/FAQPage";
import ShippingPage from "./pages/Help/ShippingPage";
import ReturnsRefundsPage from "./pages/Help/ReturnsRefundsPage";
import AboutPage from "./pages/About/AboutPage";
import CareersPage from "./pages/About/CareersPage";
import PressPage from "./pages/About/PressPage";
import ProfilePage from "./pages/User/ProfilePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import InformationLayout from "./components/layouts/InformationLayout";

export default function App() {

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/:tab" element={<Home />} />

            <Route path="/search" element={<SearchPage />} />
            <Route path="/s" element={<MobileSearchPage />} />
            <Route path="/c" element={<MobileCatalogPage />} />

            <Route path="/u/:username" element={<ProfilePage />} />
            <Route path="/u/:username/:tab" element={<ProfilePage />} />

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/product/:productId/:tab" element={<ProductPage />} />

            <Route path="/category/*" element={<CategoryPage />} />

            <Route path="/videos" element={<ReelsPage />} />
            <Route path="/videos/:id" element={<ReelsPage />} />

            <Route path="/videos/me" element={<MyVideosPage />} />

            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/profile/edit" element={<ProfileEditPage />} />

            <Route path="/account/addresses" element={<AddressesPage />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/security" element={<SecurityPage />} />


            <Route path="/account/settings" element={<SettingsPage />} />

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
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/:tab" element={<AuthScreen />} />
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>

          <Route element={<CheckoutLayout />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>

          <Route element={<InformationLayout />}>
            {/* About */}
            <Route path="about" element={<AboutPage />} />
            <Route path="about/careers" element={<CareersPage />} />
            <Route path="about/press" element={<PressPage />} />
            {/* Help */}
            <Route path="help/contact" element={<ContactPage />} />
            <Route path="help/faq" element={<FAQPage />} />
            <Route path="help/shipping" element={<ShippingPage />} />
            <Route path="help/returns-refunds" element={<ReturnsRefundsPage />} />
            {/* Legal */}
            <Route path="legal/terms" element={<TermsPage />} />
            <Route path="legal/privacy" element={<PrivacyPolicyPage />} />
            <Route path="legal/cookies" element={<CookiePolicyPage />} />
            <Route path="legal/imprint" element={<ImprintPage />} />
            <Route path="legal/sitemap" element={<SitemapPage />} />
            <Route path="*" element={<NotFound supportHref="mailto:support@example.com" />} />
          </Route>
        </Routes>

        <CookieConsent policyUrl="/privacy" brandName="Dashedo" />
      </AuthProvider>
    </>
  );
}

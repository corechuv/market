import "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import WishlistPage from "./pages/Wishlist/WishlistPage";
import SearchPage from "./pages/Search/SearchPage";
import ProductsPage from "./pages/Product/ProductsPage";
import ProductPage from "./pages/Product/ProductPage";
import CategoryPage from "./pages/Category/CategoryPage";
import AuthPage from "./pages/Auth/AuthPage";
import "./styles/scrollbar.module.scss";

import MainLayout from "./components/layouts/MainLayout";
import AuthLayout from "./components/layouts/AuthLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/category/*" element={<CategoryPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        {/* /auth и любые /auth/* без Header/Footer */}
        <Route path="/auth" element={<AuthPage />} />
      </Route>
    </Routes>
  );
}

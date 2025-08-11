import 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import ProductPage from './pages/Product/ProductPage'
import Home from './pages/Home/Home'
import ProductsPage from './pages/Product/ProductsPage'
import SearchPage from './pages/Search/SearchPage'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import "./styles/scrollbar.module.scss" // Import global variables

export default function App() {

  return (
    <>
      <Header />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/1" element={<ProductPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

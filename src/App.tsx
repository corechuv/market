import 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Product from './pages/Product/Product'
import Home from './pages/Home/Home'
import ProductList from './pages/Product/ProductList'
import Search from './pages/Search/SearchPage'
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

          <Route path="/search" element={<Search />} />

          <Route path="/products" element={<ProductList />} />
          <Route path="/product/1" element={<Product />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

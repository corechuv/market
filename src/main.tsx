import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async"
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import "./i18n";

import './index.css'
import "./styles/theme.module.scss" // Import global styles
import { CartProvider } from './context/CartContext.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import { LangProvider } from './context/LangContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LangProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
              <ScrollToTop />
              <App />
            </BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </LangProvider>
    </HelmetProvider>
  </StrictMode>,
)

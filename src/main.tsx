import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import "./styles/theme.module.scss" // Import global styles
import { CartProvider } from './context/CartContext.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import { LangProvider } from './context/LangContext.tsx'
// import { AccountProvider } from './context/AccountContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*<AccountProvider>*/}
    <LangProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </CartProvider>
    </LangProvider>
    {/*</AccountProvider>*/}
  </StrictMode>,
)

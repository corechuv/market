import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Navigation from "../Navigation/Navigation";
import c from "./MainLayout.module.scss"

export default function MainLayout() {
  return (
    <>
      <div className={c.m}>
        <Navigation />
        <main className="app-container">
          <Outlet />
          <Footer />
        </main>
      </div>
    </>
  );
}

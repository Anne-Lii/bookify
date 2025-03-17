import './Layout.css';
import { Outlet } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="layout-container">
    <Header />
    <main className="content">
      <Outlet />
    </main>
    <Footer />
  </div>
  )
}

export default Layout





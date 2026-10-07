import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, LinearProgress } from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './App.scss';
import AdminLogin from "./Pages/General/Signin.jsx";
import AdminFooter from "./Pages/Partials/AdminFooter.jsx";
import AdminNavbar from "./Pages/Partials/AdminNavbar.jsx";
import HoriNavbar from "./Pages/Partials/HoriNavbar.jsx";
import SystemRouter from "./Router/System.jsx";
import AttributesRouter from "./Router/Attributes.jsx";
import MainRouter from "./Router/Main.jsx";
import SupportRouter from "./Router/Support.jsx";
import ProductsRouter from "./Router/Products.jsx";
import UserRouter from "./Router/User.jsx";
import { LanguageProvider } from './Context/LanguageContext.jsx';
import { FiscalYearProvider } from './Context/FiscalYearContext.jsx';
import Logout from "./Pages/General/Logout.jsx";
import PageNotFound from "./Pages/Partials/PageNotFound.jsx";

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let activeRequests = 0;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      activeRequests++;
      setLoading(true);
      try {
        return await originalFetch(...args);
      } finally {
        activeRequests--;
        if (activeRequests === 0) {
          setLoading(false);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const isLoginPage = location.pathname.includes("Signin")
    || location.pathname.includes("Forgot-Password")
    || location.pathname.includes("ConfirmPassword")
    || location.pathname === "/";

  return (
    <>
      {loading && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            zIndex: 9999,
            backgroundColor: "color-mix(in srgb, var(--primary-color) 20%, transparent)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "var(--primary-color)",
            },
          }}
        />
      )}
      {!isLoginPage && <AdminNavbar />}
      {!isLoginPage && <HoriNavbar />}
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Signin" element={<AdminLogin />} />
        <Route path={`/Home/*`} element={<MainRouter />} />
        <Route path={`/Products/*`} element={<ProductsRouter />} />
        <Route path={`/Attributes/*`} element={<AttributesRouter />} />
        <Route path={`/Support/*`} element={<SupportRouter />} />
        <Route path={`/User/*`} element={<UserRouter />} />
        <Route path={`/System/*`} element={<SystemRouter />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {!isLoginPage && <AdminFooter />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LanguageProvider>
        <FiscalYearProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </FiscalYearProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
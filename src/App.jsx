import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, LinearProgress } from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './App.scss';
import AdminLogin from "./Pages/General/Signin.jsx";
import Logout from "./Pages/General/Logout.jsx";
import Dashboard from "./Pages/Home/Dashboard.jsx";
import { LanguageProvider } from './Context/LanguageContext.jsx';
import PageNotFound from "./Pages/Partials/PageNotFound.jsx";

const AppContent = () => {
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
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/Signin" element={<AdminLogin />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Home/Dashboard" element={<Dashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
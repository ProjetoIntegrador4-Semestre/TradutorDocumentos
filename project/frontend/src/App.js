import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Translator from "./components/Translator";
import History from "./components/History";
import Settings from "./components/Settings";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import { ThemeProvider } from "./theme/ThemeContext";
import "./theme/theme.css";
import "./App.css";

import Login from "./components/Login";
import Register from "./components/Register";
import GoogleCallback from "./components/GoogleCallback";
import { getToken } from "./auth";

function PrivateLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div>
        <Header />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = !!getToken();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* privadas */}
          <Route path="/translator" element={
            isAuthenticated ? <PrivateLayout><Translator/></PrivateLayout> : <Navigate to="/login" />
          }/>
          <Route path="/history" element={
            isAuthenticated ? <PrivateLayout><History/></PrivateLayout> : <Navigate to="/login" />
          }/>
          <Route path="/settings" element={
            isAuthenticated ? <PrivateLayout><Settings/></PrivateLayout> : <Navigate to="/login" />
          }/>

          {/* default */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/translator" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

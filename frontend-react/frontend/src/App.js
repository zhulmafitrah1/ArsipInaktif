import "./App.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InputArsip from "./pages/InputArsip";
import DataArsip from "./pages/DataArsip";
import Login from "./pages/Login";
import LaporanPemusnahan from "./pages/LaporanPemusnahan";
import ProfileSaya from "./pages/ProfileSaya";
import ManajemenUser from "./pages/ManajemenUser";
import { apiClient } from "./lib/apiClient";

function AdminRoute({ children }) {
  const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
  if (userProfile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {

  /* ================= LOGIN ================= */
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  /* ================= DATA ARSIP ================= */
  const [arsipData, setArsipData] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      apiClient
        .get("/arsip")
        .then((data) => setArsipData(data.data || data))
        .catch((err) => console.error("Error fetch arsip:", err));
    }
  }, [isLoggedIn]);

  /* ================= HANDLER ================= */
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("role");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("token");
  };

  return (
    <Router>

      {isLoggedIn ? (

        <Layout onLogout={handleLogout}>

          <Routes>

            <Route
              path="/"
              element={
                <Dashboard
                  arsipData={arsipData}
                  setArsipData={setArsipData}
                />
              }
            />

            <Route
              path="/input-arsip"
              element={
                <InputArsip
                  arsipData={arsipData}
                  setArsipData={setArsipData}
                />
              }
            />

            <Route
              path="/data-arsip"
              element={
                <DataArsip
                  arsipData={arsipData}
                  setArsipData={setArsipData}
                />
              }
            />

            <Route
              path="/laporan-pemusnahan"
              element={
                <LaporanPemusnahan arsipData={arsipData} />
              }
            />

            <Route
              path="/profile-saya"
              element={<ProfileSaya />}
            />

            <Route
              path="/manajemen-user"
              element={
                <AdminRoute>
                  <ManajemenUser />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

        </Layout>

      ) : (

        <Routes>

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

      )}

    </Router>
  );
}

export default App;
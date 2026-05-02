import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import AdminUpload from "./pages/AdminUpload";
import ContentViewer from "./pages/ContentViewer";
import VerifyCertificate from "./pages/VerifyCertificate";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* 🔧 SCROLL TO TOP */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

/* 🔧 LAYOUT */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <AppLayout>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/content/:id" element={<ContentViewer />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />

          {/* AUTHENTICATED USERS */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* ADMIN ONLY */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminUpload />} />
          </Route>

        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
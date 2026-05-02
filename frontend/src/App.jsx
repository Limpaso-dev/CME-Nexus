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
import About from "./pages/About";
import Contact from "./pages/Contact";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-1">
        <RoutesRenderer />
      </main>
      <Footer />
    </div>
  );
}

function RoutesRenderer() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:id" element={<VerifyCertificate />} />

      <Route element={<ProtectedRoute redirectTo="/register" />}>
        <Route path="/library" element={<Library />} />
        <Route path="/content/:id" element={<ContentViewer />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminUpload />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
            Page not found
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

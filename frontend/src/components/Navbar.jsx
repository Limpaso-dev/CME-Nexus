import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // ✅ important
    navigate("/login");
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path ? "text-cyan-400" : "";

  return (
    <nav className="bg-blue-900 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* BRAND */}
        <Link to="/" className="text-lg sm:text-xl font-semibold">
          CME Nexus
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className={`hover:text-cyan-400 ${isActive("/")}`}>
            Home
          </Link>

          <Link to="/library" className={`hover:text-cyan-400 ${isActive("/library")}`}>
            Library
          </Link>

          {token && (
            <Link to="/dashboard" className={`hover:text-cyan-400 ${isActive("/dashboard")}`}>
              Dashboard
            </Link>
          )}

          {/* ✅ ADMIN LINK */}
          {role === "admin" && (
            <Link to="/admin" className={`hover:text-cyan-400 ${isActive("/admin")}`}>
              Admin
            </Link>
          )}
        </div>

        {/* DESKTOP AUTH */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {!token ? (
            <>
              <Link
                to="/login"
                className="border border-white px-4 py-1.5 rounded hover:bg-white hover:text-blue-900 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-cyan-500 px-4 py-1.5 rounded hover:bg-cyan-400 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="border border-white px-4 py-1.5 rounded hover:bg-white hover:text-blue-900 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="md:hidden text-2xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE MENU */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-blue-800 px-4 pb-4 space-y-3 text-sm ${
          open ? "block" : "hidden"
        }`}
      >
        <Link to="/" className={`block py-2 ${isActive("/")}`}>
          Home
        </Link>

        <Link to="/library" className={`block py-2 ${isActive("/library")}`}>
          Library
        </Link>

        {token && (
          <Link to="/dashboard" className={`block py-2 ${isActive("/dashboard")}`}>
            Dashboard
          </Link>
        )}

        {/* ✅ ADMIN MOBILE */}
        {role === "admin" && (
          <Link to="/admin" className={`block py-2 ${isActive("/admin")}`}>
            Admin
          </Link>
        )}

        <div className="pt-3 border-t border-blue-700">
          {!token ? (
            <>
              <Link to="/login" className="block py-2">
                Login
              </Link>

              <Link
                to="/register"
                className="block bg-cyan-500 px-3 py-2 rounded text-center mt-2"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="w-full text-left py-2"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
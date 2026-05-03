import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const protectedHref = (token, path) => (token ? path : "/register");

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path ? "text-cyan-300" : "";

  return (
    <nav className="sticky top-0 bg-blue-950/95 backdrop-blur text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* 🔷 BRAND WITH LOGO */}
        <Link to="/" className="flex items-center gap-3">
          
          <img
            src="/logo.png"
            alt="CME Nexus"
            className="w-10 h-10 object-contain"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-semibold tracking-wide">
              CME Nexus
            </span>
            <span className="text-[11px] text-blue-100">
              Smarter CME. Seamless Access.
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className={`hover:text-cyan-300 ${isActive("/")}`}>Home</Link>
          <Link to={protectedHref(token, "/library")} className={`hover:text-cyan-300 ${isActive("/library")}`}>Library</Link>
          <Link to={protectedHref(token, "/dashboard")} className={`hover:text-cyan-300 ${isActive("/dashboard")}`}>Dashboard</Link>
          <Link to="/about" className={`hover:text-cyan-300 ${isActive("/about")}`}>About</Link>
          <Link to="/contact" className={`hover:text-cyan-300 ${isActive("/contact")}`}>Contact</Link>

          {role === "admin" && (
            <Link to="/admin" className={`hover:text-cyan-300 ${isActive("/admin")}`}>
              Upload
            </Link>
          )}
        </div>

        {/* DESKTOP AUTH */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {token ? (
            <>
              <span className="text-blue-100">
                {name ? `Welcome ${name}` : "Signed in"}
              </span>

              <button
                onClick={logout}
                className="border border-white/60 px-4 py-1.5 rounded hover:bg-white hover:text-blue-950 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-white/60 px-4 py-1.5 rounded hover:bg-white hover:text-blue-950 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-cyan-500 px-4 py-1.5 rounded hover:bg-cyan-400 transition text-blue-950 font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen((current) => !current)}
          className="md:hidden text-2xl"
        >
          {open ? "x" : "☰"}
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
        className={`md:hidden absolute top-full left-0 w-full bg-blue-900 px-4 pb-4 space-y-3 text-sm ${
          open ? "block" : "hidden"
        }`}
      >
        <Link to="/" className={`block py-2 ${isActive("/")}`}>Home</Link>
        <Link to={protectedHref(token, "/library")} className={`block py-2 ${isActive("/library")}`}>Library</Link>
        <Link to={protectedHref(token, "/dashboard")} className={`block py-2 ${isActive("/dashboard")}`}>Dashboard</Link>
        <Link to="/about" className={`block py-2 ${isActive("/about")}`}>About</Link>
        <Link to="/contact" className={`block py-2 ${isActive("/contact")}`}>Contact</Link>

        {role === "admin" && (
          <Link to="/admin" className={`block py-2 ${isActive("/admin")}`}>
            Upload
          </Link>
        )}

        <div className="pt-3 border-t border-blue-800">
          {token ? (
            <>
              <p className="text-blue-100 mb-2">
                {name ? `Welcome ${name}` : "Signed in"}
              </p>

              <button
                onClick={logout}
                className="w-full text-left py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2">Login</Link>
              <Link
                to="/register"
                className="block bg-cyan-500 text-blue-950 px-3 py-2 rounded text-center mt-2 font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
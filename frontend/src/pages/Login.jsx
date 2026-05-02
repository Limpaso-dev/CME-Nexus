import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("name", res.name);

      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-sm border">
        <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs text-center mb-3">Login Page</p>
        <h2 className="text-2xl font-semibold text-center mb-3">Sign in to your CME workspace</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Sign in to access your CME dashboard, manage your learning, and stay on track with your professional development.
        </p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-xl hover:bg-blue-800 transition text-sm"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Do not have an account?{" "}
          <Link to="/register" className="text-cyan-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

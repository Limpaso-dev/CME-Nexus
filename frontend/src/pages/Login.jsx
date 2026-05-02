import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submit = async () => {
    if (!form.email || !form.password) {
      return setError("Email and password are required");
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", form);

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      // ✅ REDIRECT
      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md border">

        {/* TITLE */}
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6">
          Welcome Back
        </h2>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* FORM */}
        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition text-sm"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-600 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
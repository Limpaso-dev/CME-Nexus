import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", form);

      navigate("/login"); // ✅ no page reload

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
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
          Create Account
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
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

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
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-600 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
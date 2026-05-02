import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profession: "",
    organization: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl shadow-sm border">
        <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs text-center mb-3">Create Account</p>
        <h2 className="text-2xl font-semibold text-center mb-3">Access the CME library and dashboard</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          A user must create an account to access the content, track CME progress, and download earned certificates.
        </p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <input
            type="text"
            placeholder="Profession"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <input
            type="text"
            placeholder="Organization"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />

          <div className="sm:col-span-2">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-6 bg-blue-900 text-white py-3 rounded-xl hover:bg-blue-800 transition text-sm"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

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

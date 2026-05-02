import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCredits: 0, completed: 0, certificates: 0 });
  const [profile, setProfile] = useState(null);
  const [recentProgress, setRecentProgress] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [dash, certData] = await Promise.all([
          API.get("/dashboard"),
          API.get("/certificate/mine")
        ]);

        setStats({
          totalCredits: dash?.totalCredits || 0,
          completed: dash?.completedSessions || 0,
          certificates: dash?.certificates || 0
        });
        setProfile(dash?.user || null);
        setRecentProgress(Array.isArray(dash?.recentProgress) ? dash.recentProgress : []);
        setCerts(Array.isArray(certData) ? certData : []);
      } catch (err) {
        setError(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
          <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-3">Dashboard</p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Welcome {profile?.name || localStorage.getItem("name") || "back"}.
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Manage your CME, track your progress, and stay organized all in one place.
          </p>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total CME Credits" value={stats.totalCredits} />
          <StatCard label="Completed Sessions" value={stats.completed} />
          <StatCard label="Certificates Earned" value={stats.certificates} />
          <StatCard label="Profession" value={profile?.profession || "Not set"} />
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-5">Profile</h2>
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <ProfileRow label="Name" value={profile?.name} />
                <ProfileRow label="Email" value={profile?.email} />
                <ProfileRow label="Profession" value={profile?.profession || "Not set"} />
                <ProfileRow label="Organization" value={profile?.organization || "Not set"} />
                <ProfileRow label="Role" value={profile?.role || localStorage.getItem("role")} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-5">Recent Learning Progress</h2>
            <div className="space-y-4">
              {loading && Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && recentProgress.map((item) => (
                <div key={item._id} className="border rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.contentId?.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.contentId?.discipline || "Discipline not set"} | {item.contentId?.contentType || "Type not set"}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-900 text-xs px-3 py-1 rounded-full w-fit">
                      {item.completed ? "Completed" : "In progress"}
                    </span>
                  </div>
                </div>
              ))}

              {!loading && recentProgress.length === 0 && (
                <p className="text-sm text-gray-500">No learning activity yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-5">Certificates</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {loading && Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}

            {!loading && certs.map((cert) => (
              <div key={cert._id} className="border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{cert.contentId?.title || "Certificate"}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL}/certificate/download/${cert.certificateId}`}
                  className="inline-flex items-center justify-center bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 text-sm"
                >
                  Download
                </a>
              </div>
            ))}

            {!loading && certs.length === 0 && (
              <p className="text-sm text-gray-500">No certificates earned yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-3xl border shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-2xl font-semibold text-blue-950 mt-2 break-words">{value}</h2>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 border px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900">{value || "Not set"}</p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const role = localStorage.getItem("role");

  return role === "admin" ? <AdminDashboard /> : <LearnerDashboard />;
}

function LearnerDashboard() {
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
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#133b8a_52%,#0b6d96_100%)] p-6 text-white shadow-sm sm:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-200">Dashboard</p>
          <h1 className="mb-3 text-3xl font-semibold">
            Welcome {profile?.name || localStorage.getItem("name") || "back"}.
          </h1>
          <p className="max-w-3xl text-blue-100">
            Manage your CME, track your progress, and stay organized all in one place.
          </p>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total CME Credits" value={stats.totalCredits} accent="brand" />
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
                      <p className="text-sm text-gray-600 mt-2">
                        Progress: {item.percentComplete || 0}%
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

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const dashboard = await API.get("/dashboard/admin");
        setData(dashboard);
      } catch (err) {
        setError(err?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#0f766e_100%)] text-white p-6 sm:p-8 shadow-sm">
          <p className="text-cyan-200 uppercase tracking-[0.22em] text-xs mb-3">Admin Command Center</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold mb-3">Welcome {localStorage.getItem("name") || "Admin"}.</h1>
              <p className="text-blue-100 max-w-3xl">
                Track the overall state of CME Nexus, monitor content activity, review user growth, and keep the platform organized from one professional system view.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin"
                className="bg-white text-blue-950 px-5 py-3 rounded-xl font-medium hover:bg-blue-50 transition text-center"
              >
                Open Upload Workspace
              </Link>
              <Link
                to="/library"
                className="border border-white/60 px-5 py-3 rounded-xl hover:bg-white hover:text-blue-950 transition text-center"
              >
                Review Live Library
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminStatCard label="Total Users" value={data?.totalUsers} accent="blue" loading={loading} />
          <AdminStatCard label="Active Learners" value={data?.totalLearners} accent="cyan" loading={loading} />
          <AdminStatCard label="Admins" value={data?.totalAdmins} accent="slate" loading={loading} />
          <AdminStatCard label="Certificates Issued" value={data?.totalCertificates} accent="emerald" loading={loading} />
          <AdminStatCard label="Library Content" value={data?.totalContent} accent="blue" loading={loading} />
          <AdminStatCard label="Courses" value={data?.totalCourses} accent="indigo" loading={loading} />
          <AdminStatCard label="Single Sessions" value={data?.totalSessions} accent="cyan" loading={loading} />
          <AdminStatCard label="Live Events" value={data?.totalLiveEvents} accent="emerald" loading={loading} />
        </section>

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold">Operational Summary</h2>
                <p className="text-sm text-gray-500 mt-1">A quick view of system-wide progress and learning output.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InsightCard
                label="Completed Sessions"
                value={data?.completedSessions}
                description="Total completions recorded across all learners."
                loading={loading}
              />
              <InsightCard
                label="Content Coverage"
                value={data?.contentByDiscipline?.length || 0}
                description="Top disciplines currently represented in the library."
                loading={loading}
              />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Content Mix</h3>
              <div className="space-y-3">
                {loading && Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
                ))}

                {!loading && (data?.contentByType || []).map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                    <span className="capitalize text-gray-700">{item._id || "unspecified"}</span>
                    <span className="font-semibold text-blue-950">{item.count}</span>
                  </div>
                ))}

                {!loading && (!data?.contentByType || data.contentByType.length === 0) && (
                  <p className="text-sm text-gray-500">No content type data available yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-5">Top Disciplines</h2>
            <div className="space-y-3">
              {loading && Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.contentByDiscipline || []).map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
                  <span className="text-gray-700">{item._id}</span>
                  <span className="font-semibold text-blue-950">{item.count}</span>
                </div>
              ))}

              {!loading && (!data?.contentByDiscipline || data.contentByDiscipline.length === 0) && (
                <p className="text-sm text-gray-500">No discipline distribution available yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold">Recent Users</h2>
                <p className="text-sm text-gray-500 mt-1">Newest accounts joining the platform.</p>
              </div>
            </div>

            <div className="space-y-4">
              {loading && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.recentUsers || []).map((user) => (
                <div key={user._id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full capitalize">
                      {user.profession || "Not set"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold">Recent Content Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Latest library additions and admin-managed content.</p>
              </div>
              <Link to="/admin" className="text-sm text-cyan-700 hover:underline">
                Manage content
              </Link>
            </div>

            <div className="space-y-4">
              {loading && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.recentContent || []).map((item) => (
                <div key={item._id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.discipline || "Discipline not set"} | {item.learningMode || "session"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Added by {item.createdBy?.name || "Admin"}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-900 text-xs px-3 py-1 rounded-full capitalize">
                      {item.contentType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "default" }) {
  if (accent === "brand") {
    return (
      <div className="rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#0f766e_100%)] p-5 text-white shadow-sm">
        <p className="text-sm text-cyan-100">{label}</p>
        <h2 className="mt-2 break-words text-3xl font-semibold">{value}</h2>
      </div>
    );
  }

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

function AdminStatCard({ label, value, loading, accent }) {
  const accents = {
    blue: "from-blue-950 to-blue-700",
    cyan: "from-cyan-700 to-cyan-500",
    emerald: "from-emerald-700 to-emerald-500",
    indigo: "from-indigo-800 to-indigo-500",
    slate: "from-slate-800 to-slate-600"
  };

  return (
    <div className={`rounded-3xl p-[1px] bg-gradient-to-br ${accents[accent] || accents.blue}`}>
      <div className="bg-white rounded-[calc(1.5rem-1px)] p-5 h-full">
        <p className="text-sm text-gray-500">{label}</p>
        {loading ? (
          <div className="h-8 w-20 mt-3 rounded bg-gray-100 animate-pulse" />
        ) : (
          <h2 className="text-3xl font-semibold text-slate-900 mt-2">{value ?? "-"}</h2>
        )}
      </div>
    </div>
  );
}

function InsightCard({ label, value, description, loading }) {
  return (
    <div className="rounded-3xl border bg-slate-50 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <div className="h-7 w-16 mt-3 rounded bg-gray-200 animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-slate-900 mt-2">{value ?? "-"}</p>
      )}
      <p className="text-sm text-gray-500 mt-3">{description}</p>
    </div>
  );
}

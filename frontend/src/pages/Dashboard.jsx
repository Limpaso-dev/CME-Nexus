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
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        <section className="rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#133b8a_52%,#0b6d96_100%)] p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-cyan-200 sm:mb-3">Dashboard</p>
          <h1 className="mb-2 text-2xl font-semibold sm:mb-3 sm:text-3xl">
            Welcome {profile?.name || localStorage.getItem("name") || "back"}.
          </h1>
          <p className="max-w-3xl text-sm text-blue-100 sm:text-base">
            Manage your CME, track your progress, and stay organized all in one place.
          </p>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total CME Credits" value={stats.totalCredits} accent="brand" />
          <StatCard label="Completed Sessions" value={stats.completed} />
          <StatCard label="Certificates Earned" value={stats.certificates} />
          <StatCard label="Profession" value={profile?.profession || "Not set"} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <h2 className="mb-4 text-lg font-semibold sm:mb-5 sm:text-xl">Profile</h2>
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-1 sm:gap-4">
                <ProfileRow label="Name" value={profile?.name} />
                <ProfileRow label="Email" value={profile?.email} />
                <ProfileRow label="Profession" value={profile?.profession || "Not set"} />
                <ProfileRow label="Organization" value={profile?.organization || "Not set"} />
                <ProfileRow label="Role" value={profile?.role || localStorage.getItem("role")} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <h2 className="mb-4 text-lg font-semibold sm:mb-5 sm:text-xl">Recent Learning Progress</h2>
            <div className="space-y-3 sm:space-y-4">
              {loading && Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && recentProgress.map((item) => (
                <div key={item._id} className="border rounded-2xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="font-medium leading-snug text-gray-900">{item.contentId?.title}</p>
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

        <section className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
          <h2 className="mb-4 text-lg font-semibold sm:mb-5 sm:text-xl">Certificates</h2>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {loading && Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}

            {!loading && certs.map((cert) => (
              <div key={cert._id} className="border rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:p-4">
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
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
        <section className="rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#0f766e_100%)] text-white p-5 sm:rounded-[2rem] sm:p-8 shadow-sm">
          <p className="text-cyan-200 uppercase tracking-[0.22em] text-xs mb-2 sm:mb-3">Admin Command Center</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2 sm:mb-3 sm:text-3xl">Welcome {localStorage.getItem("name") || "Admin"}.</h1>
              <p className="text-sm text-blue-100 max-w-3xl sm:text-base">
                Track the overall state of CME Nexus, monitor content activity, review user growth, and keep the platform organized from one professional system view.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <Link
                to="/admin"
                className="bg-white text-blue-950 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition text-center sm:px-5 sm:py-3 sm:text-base"
              >
                Open Upload Workspace
              </Link>
              <Link
                to="/library"
                className="border border-white/60 px-3 py-2.5 rounded-xl text-sm hover:bg-white hover:text-blue-950 transition text-center sm:px-5 sm:py-3 sm:text-base"
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

        <section className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          <AdminStatCard label="Total Users" value={data?.totalUsers} accent="blue" loading={loading} />
          <AdminStatCard label="Active Learners" value={data?.totalLearners} accent="cyan" loading={loading} />
          <AdminStatCard label="Admins" value={data?.totalAdmins} accent="slate" loading={loading} />
          <AdminStatCard label="Certificates Issued" value={data?.totalCertificates} accent="emerald" loading={loading} />
          <AdminStatCard label="Library Content" value={data?.totalContent} accent="blue" loading={loading} />
          <AdminStatCard label="Courses" value={data?.totalCourses} accent="indigo" loading={loading} />
          <AdminStatCard label="Single Sessions" value={data?.totalSessions} accent="cyan" loading={loading} />
          <AdminStatCard label="Live Events" value={data?.totalLiveEvents} accent="emerald" loading={loading} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">Operational Summary</h2>
                <p className="hidden text-sm text-gray-500 mt-1 sm:block">A quick view of system-wide progress and learning output.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
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

            <div className="mt-5 sm:mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4">Content Mix</h3>
              <div className="space-y-2 sm:space-y-3">
                {loading && Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
                ))}

                {!loading && (data?.contentByType || []).map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-xl border bg-slate-50 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
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

          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <h2 className="text-lg font-semibold mb-4 sm:mb-5 sm:text-xl">Top Disciplines</h2>
            <div className="space-y-2 sm:space-y-3">
              {loading && Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.contentByDiscipline || []).map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-xl border bg-slate-50 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
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

        <section className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">Recent Users</h2>
                <p className="hidden text-sm text-gray-500 mt-1 sm:block">Newest accounts joining the platform.</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.recentUsers || []).map((user) => (
                <div key={user._id} className="rounded-2xl border p-3 sm:p-4">
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

          <div className="bg-white rounded-2xl border shadow-sm p-4 sm:rounded-3xl sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">Recent Content Activity</h2>
                <p className="hidden text-sm text-gray-500 mt-1 sm:block">Latest library additions and admin-managed content.</p>
              </div>
              <Link to="/admin" className="text-sm text-cyan-700 hover:underline">
                Manage content
              </Link>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading && Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}

              {!loading && (data?.recentContent || []).map((item) => (
                <div key={item._id} className="rounded-2xl border p-3 sm:p-4">
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
      <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#0f766e_100%)] p-3 text-white shadow-sm sm:rounded-3xl sm:p-5">
        <p className="text-xs text-cyan-100 sm:text-sm">{label}</p>
        <h2 className="mt-1 break-words text-2xl font-semibold sm:mt-2 sm:text-3xl">{value}</h2>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-2xl border shadow-sm sm:p-5 sm:rounded-3xl">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <h2 className="mt-1 break-words text-xl font-semibold text-blue-950 sm:mt-2 sm:text-2xl">{value}</h2>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 border px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="break-words text-sm text-gray-900 sm:text-base">{value || "Not set"}</p>
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
    <div className={`rounded-2xl p-[1px] bg-gradient-to-br sm:rounded-3xl ${accents[accent] || accents.blue}`}>
      <div className="bg-white rounded-[calc(1rem-1px)] p-3 h-full sm:rounded-[calc(1.5rem-1px)] sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
        {loading ? (
          <div className="h-7 w-16 mt-2 rounded bg-gray-100 animate-pulse sm:mt-3 sm:h-8 sm:w-20" />
        ) : (
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 sm:mt-2 sm:text-3xl">{value ?? "-"}</h2>
        )}
      </div>
    </div>
  );
}

function InsightCard({ label, value, description, loading }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-3 sm:rounded-3xl sm:p-5">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      {loading ? (
        <div className="h-6 w-14 mt-2 rounded bg-gray-200 animate-pulse sm:mt-3 sm:h-7 sm:w-16" />
      ) : (
        <p className="mt-1 text-xl font-semibold text-slate-900 sm:mt-2 sm:text-2xl">{value ?? "-"}</p>
      )}
      <p className="hidden text-sm text-gray-500 mt-3 sm:block">{description}</p>
    </div>
  );
}

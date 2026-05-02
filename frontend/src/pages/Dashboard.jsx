import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCredits: 0,
    completed: 0,
    certificates: 0,
  });

  const [recent, setRecent] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const dashRes = await API.get("/dashboard");
      setStats({
        totalCredits: dashRes.data.totalCredits,
        completed: dashRes.data.completedSessions,
        certificates: dashRes.data.certificates
      });

      const contentRes = await API.get("/content");
      setRecent(contentRes.data.slice(0, 5));

      const certRes = await API.get("/certificate/mine");
      setCerts(certRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-6">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Manage your CME, track your progress, and stay organized
        </p>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <StatCard label="Total CME Credits" value={stats.totalCredits} />
        <StatCard label="Completed Sessions" value={stats.completed} />
        <StatCard label="Certificates Earned" value={stats.certificates} />
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* RECENT */}
        <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">
            Recent CME Content
          </h3>

          {loading && <p className="text-sm">Loading...</p>}

          {!loading && recent.map(item => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b py-3 text-xs sm:text-sm gap-2"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-gray-500 text-xs">{item.discipline}</p>
              </div>

              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 hover:underline"
              >
                View
              </a>
            </div>
          ))}

          {!loading && recent.length === 0 && (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>

        {/* CERTIFICATES */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">
            Certificates
          </h3>

          {loading && <p className="text-sm">Loading...</p>}

          {!loading && certs.length === 0 && (
            <p className="text-sm text-gray-500">
              No certificates yet.
            </p>
          )}

          <div className="space-y-3">
            {certs.map(cert => (
              <div
                key={cert._id}
                className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm gap-2"
              >
                <div>
                  <p className="font-medium">
                    {cert.contentId?.title}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>

                <a
                  href={`http://localhost:5000/api/certificate/download/${cert.certificateId}`}
                  className="text-cyan-600 hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border shadow-sm">
      <p className="text-xs sm:text-sm text-gray-500">
        {label}
      </p>
      <h2 className="text-xl sm:text-2xl font-semibold text-blue-900">
        {value}
      </h2>
    </div>
  );
}
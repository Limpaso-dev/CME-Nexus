import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { resolveAssetUrl } from "../services/api";

const disciplines = [
  "Hematology",
  "Microbiology",
  "Chemistry",
  "Molecular Biology",
  "Lab Management",
  "Quality Assurance",
  "Parasitology",
  "Lab Automation"
];

const formatDate = (value) => {
  if (!value) {
    return "Date not set";
  }

  return new Date(value).toLocaleDateString();
};

export default function Library() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    discipline: "",
    topic: "",
    speaker: "",
    contentType: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value)
        );
        const res = await API.get("/content", { params });
        setItems(Array.isArray(res) ? res : []);
      } catch (err) {
        setError(err?.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filters]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      discipline: "",
      topic: "",
      speaker: "",
      contentType: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white border rounded-3xl shadow-sm p-6 sm:p-8">
          <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-3">Library</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-3">Find the resources you need to stay informed, skilled, and ahead.</h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
                Search by topic, speaker, date, keywords, discipline, and content type. The filters below work like clickable library controls, as outlined in your product document.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="border border-blue-200 text-blue-900 px-4 py-2 rounded-xl hover:bg-blue-50 text-sm"
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {disciplines.map((discipline) => {
            const active = filters.discipline === discipline;
            return (
              <button
                key={discipline}
                onClick={() => updateFilter("discipline", active ? "" : discipline)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                    : "bg-white hover:border-cyan-400"
                }`}
              >
                <p className="font-medium">{discipline}</p>
                <p className={`text-xs mt-1 ${active ? "text-blue-100" : "text-gray-500"}`}>Discipline filter</p>
              </button>
            );
          })}
        </section>

        <section className="bg-white border rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search topic, speaker, keyword"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            />
            <input
              type="text"
              placeholder="Topic"
              value={filters.topic}
              onChange={(e) => updateFilter("topic", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            />
            <input
              type="text"
              placeholder="Speaker"
              value={filters.speaker}
              onChange={(e) => updateFilter("speaker", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            />
            <select
              value={filters.contentType}
              onChange={(e) => updateFilter("contentType", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            >
              <option value="">All content types</option>
              <option value="video">Recorded videos</option>
              <option value="pdf">Slide decks (PDF/PPT)</option>
              <option value="notes">Notes and summaries</option>
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              className="border px-3 py-3 rounded-xl text-sm"
            />
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading && Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-3xl border p-6 h-56 animate-pulse" />
          ))}

          {!loading && items.map((item) => (
            <article key={item._id} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition">
              {(item.thumbnailAsset?.url || item.primaryAsset?.resourceType === "image") && (
                <div className="mb-5 overflow-hidden rounded-2xl border bg-slate-100 aspect-[16/9]">
                  <img
                    src={resolveAssetUrl(item.thumbnailAsset?.url || item.primaryAsset?.url)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-medium text-cyan-700 uppercase tracking-wide">{item.discipline || "Discipline"}</p>
                  <h3 className="font-semibold text-gray-900 mt-2 text-lg">{item.title}</h3>
                </div>
                <span className="bg-blue-50 text-blue-900 text-xs px-3 py-1 rounded-full">
                  {item.credits} CME
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-6 mb-4">{item.description || item.summary || "No description provided yet."}</p>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-5">
                <div>
                  <p className="text-gray-400">Topic</p>
                  <p className="text-gray-700 mt-1">{item.topic || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Speaker</p>
                  <p className="text-gray-700 mt-1">{item.speaker || "Not set"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="text-gray-700 mt-1">{item.contentType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-gray-700 mt-1">{formatDate(item.eventDate)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Mode</p>
                  <p className="text-gray-700 mt-1 capitalize">{item.learningMode || "session"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Required time</p>
                  <p className="text-gray-700 mt-1">{item.minCompletionMinutes || 10} min</p>
                </div>
              </div>

              <Link
                to={`/content/${item._id}`}
                className="inline-flex items-center justify-center w-full bg-blue-900 text-white py-3 rounded-xl hover:bg-blue-800 transition text-sm"
              >
                Open session
              </Link>
            </article>
          ))}
        </section>

        {!loading && items.length === 0 && (
          <div className="bg-white rounded-3xl border p-10 text-center text-gray-500">
            No content matched your filters.
          </div>
        )}
      </div>
    </div>
  );
}

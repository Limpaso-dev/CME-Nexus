import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { resolveAssetUrl } from "../services/api";

const disciplines = [
  "Hematology",
  "Microbiology",
  "Chemistry",
  "Molecular Diagnostics",
  "Lab Management & Quality Assurance",
  "POCT",
  "Parasitology",
  "Lab Automation",
  "Bio Safety & Bio Security",
];

const formatDate = (value) => {
  if (!value) return "Date not set";
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
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border shadow-sm">
          <div className="absolute inset-0">
            <img
              src="/Lib-1.jpg"
              alt="Medical learning library"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(6,17,40,0.9)_0%,rgba(9,35,83,0.82)_48%,rgba(8,26,58,0.32)_100%)]" />
          <div className="absolute right-0 top-0 hidden h-full w-1/3 lg:block">
            <img
              src="/Lib-2.jpg"
              alt="Learning material close-up"
              className="h-full w-full object-cover opacity-25"
            />
          </div>

          <div className="relative grid min-h-[320px] gap-8 p-6 sm:min-h-[360px] sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:p-12">
            <div className="text-white">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">Library</p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                A professional CME archive built for finding the right material quickly.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Search recorded sessions, notes, and course content using refined filters that work well on both desktop and mobile.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:ml-auto lg:max-w-md">
              <p className="text-sm font-medium text-white">Library overview</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-white">
                <LibrarySummary value={items.length} label="results" />
                <LibrarySummary value={disciplines.length} label="disciplines" />
                <LibrarySummary
                  value={filters.search || filters.discipline || filters.contentType ? "On" : "Off"}
                  label="filters"
                />
              </div>
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-blue-950 transition hover:bg-cyan-50"
              >
                Reset all filters
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {disciplines.map((discipline) => {
            const active = filters.discipline === discipline;

            return (
              <button
                key={discipline}
                onClick={() => updateFilter("discipline", active ? "" : discipline)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-blue-950 bg-blue-950 text-white shadow-md"
                    : "bg-white hover:border-cyan-400 hover:shadow-sm"
                }`}
              >
                <p className="font-medium">{discipline}</p>
                <p className={`mt-1 text-xs ${active ? "text-blue-100" : "text-slate-500"}`}>
                  Discipline filter
                </p>
              </button>
            );
          })}
        </section>

        <section className="rounded-[2rem] border bg-white/95 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Search Controls</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Refine the library</h2>
            </div>
            <p className="text-sm text-slate-500">
              Use combinations of topic, speaker, format, and dates to narrow your results.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterInput
              type="text"
              placeholder="Search topic, speaker, keyword"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
            <FilterInput
              type="text"
              placeholder="Topic"
              value={filters.topic}
              onChange={(e) => updateFilter("topic", e.target.value)}
            />
            <FilterInput
              type="text"
              placeholder="Speaker"
              value={filters.speaker}
              onChange={(e) => updateFilter("speaker", e.target.value)}
            />
            <select
              value={filters.contentType}
              onChange={(e) => updateFilter("contentType", e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All content types</option>
              <option value="video">Recorded videos</option>
              <option value="pdf">Slide decks</option>
              <option value="document">Documents and presentations</option>
              <option value="notes">Notes</option>
            </select>
            <FilterInput
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
            <FilterInput
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-[2rem] border bg-white p-6 animate-pulse"
              />
            ))}

          {!loading &&
            items.map((item, index) => {
              const previewImage =
                item.thumbnailAsset?.url ||
                (item.primaryAsset?.resourceType === "image" ? item.primaryAsset?.url : "");

              return (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-[2rem] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-200">
                    {previewImage ? (
                      <img
                        src={resolveAssetUrl(previewImage)}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <img
                        src={index % 2 === 0 ? "/Lib-2.jpg" : "/Lib-3.jpg"}
                        alt="Library fallback visual"
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/85 to-transparent px-5 py-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                        {item.discipline || "General CME"}
                      </p>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-blue-950">
                        {item.credits} CME
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold leading-snug text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {item.learningMode === "course" ? "Course format" : "Single session"} - {item.contentType}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 min-h-[4.5rem] text-sm leading-7 text-slate-600">
                      {item.description || item.summary || "No description provided yet."}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <InfoTile label="Topic" value={item.topic || "Not set"} />
                      <InfoTile label="Speaker" value={item.speaker || "Not set"} />
                      <InfoTile label="Date" value={formatDate(item.eventDate)} />
                      <InfoTile label="Required time" value={`${item.minCompletionMinutes || 10} min`} />
                    </div>

                    <Link
                      to={`/content/${item._id}`}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-950 py-3 text-sm font-medium text-white transition hover:bg-blue-900"
                    >
                      Open session
                    </Link>
                  </div>
                </article>
              );
            })}
        </section>

        {!loading && items.length === 0 && (
          <div className="rounded-[2rem] border bg-white p-10 text-center text-slate-500 shadow-sm">
            No content matched your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterInput(props) {
  return (
    <input
      {...props}
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
    />
  );
}

function LibrarySummary({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-blue-100">{label}</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}

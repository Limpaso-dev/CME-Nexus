import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Library() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await API.get("/content", {
        params: { search }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [search]);

  const filtered = data.filter(item => {
    return (
      (!discipline || item.discipline === discipline) &&
      (!type || item.contentType === type)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-6">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          CME Library
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Browse structured medical education content
        </p>
      </div>

      {/* MOBILE FILTER BUTTON */}
      <div className="max-w-7xl mx-auto mb-4 md:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-blue-900 text-white py-2 rounded"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* FILTERS */}
        <div className={`bg-white p-4 rounded-xl border shadow-sm h-fit 
          ${showFilters ? "block" : "hidden"} md:block`}>

          <h3 className="font-medium mb-4 text-blue-900 text-sm">
            Filters
          </h3>

          <input
            type="text"
            placeholder="Search topic, speaker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4 text-sm focus:ring-2 focus:ring-cyan-500"
          />

          <select
            className="w-full border px-2 py-2 rounded text-sm mb-4"
            onChange={(e) => setDiscipline(e.target.value)}
          >
            <option value="">All Disciplines</option>
            <option>Hematology</option>
            <option>Microbiology</option>
            <option>Chemistry</option>
            <option>Molecular Biology</option>
            <option>Parasitology</option>
          </select>

          <select
            className="w-full border px-2 py-2 rounded text-sm"
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="pdf">Slides</option>
            <option value="notes">Notes</option>
          </select>
        </div>

        {/* GRID */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

          {loading && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}

          {!loading && filtered.map(item => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <span className="text-xs text-cyan-600 font-medium">
                {item.discipline}
              </span>

              <h3 className="font-semibold text-gray-900 mt-2 mb-2 text-sm sm:text-base">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {item.description}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                Speaker: {item.speaker}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-blue-900 font-medium text-xs sm:text-sm">
                  {item.credits} CME
                </span>

                <Link
                  to={`/content/${item._id}`}
                  className="text-cyan-600 text-xs sm:text-sm hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-gray-500 text-sm">
              No content found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
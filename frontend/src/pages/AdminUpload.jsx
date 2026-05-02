import { useEffect, useState } from "react";
import API, { resolveAssetUrl } from "../services/api";

const emptyModule = { title: "", content: "", resourceUrl: "" };
const emptyForm = {
  title: "",
  description: "",
  discipline: "",
  topic: "",
  speaker: "",
  summary: "",
  keywords: "",
  eventDate: "",
  fileUrl: "",
  contentType: "video",
  learningMode: "session",
  credits: 5,
  isLiveEvent: false,
  primaryAsset: null,
  attachments: [],
  modules: []
};

export default function AdminUpload() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [content, setContent] = useState([]);

  const fetchAdminData = async () => {
    try {
      const [dash, contentData] = await Promise.all([
        API.get("/dashboard/admin"),
        API.get("/content")
      ]);

      setDashboard(dash);
      setContent(Array.isArray(contentData) ? contentData.slice(0, 6) : []);
    } catch (err) {
      setMessage(err?.message || "Failed to load admin data");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateModule = (index, field, value) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, moduleIndex) =>
        moduleIndex === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const addModule = () => {
    setForm((current) => ({
      ...current,
      modules: [...current.modules, { ...emptyModule }]
    }));
  };

  const removeModule = (index) => {
    setForm((current) => ({
      ...current,
      modules: current.modules.filter((_, moduleIndex) => moduleIndex !== index)
    }));
  };

  const submit = async () => {
    if (!form.title || !form.contentType) {
      setMessage("Title and content type are required");
      return;
    }

    if (
      form.learningMode === "session" &&
      !form.fileUrl &&
      !form.primaryAsset &&
      form.attachments.length === 0
    ) {
      setMessage("Add an upload or external URL for a session");
      return;
    }

    if (form.learningMode === "course" && form.modules.length === 0) {
      setMessage("Add at least one module for a course");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("discipline", form.discipline);
      payload.append("topic", form.topic);
      payload.append("speaker", form.speaker);
      payload.append("summary", form.summary);
      payload.append("keywords", form.keywords);
      payload.append("eventDate", form.eventDate);
      payload.append("fileUrl", form.fileUrl);
      payload.append("contentType", form.contentType);
      payload.append("learningMode", form.learningMode);
      payload.append("credits", String(Number(form.credits)));
      payload.append("isLiveEvent", String(form.isLiveEvent));
      payload.append("modules", JSON.stringify(form.modules));

      if (form.primaryAsset) {
        payload.append("primaryAsset", form.primaryAsset);
      }

      Array.from(form.attachments).forEach((file) => {
        payload.append("attachments", file);
      });

      await API.post("/content", payload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage("Content uploaded successfully");
      setForm(emptyForm);
      await fetchAdminData();
    } catch (err) {
      setMessage(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white border rounded-3xl shadow-sm p-6 sm:p-8">
          <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-3">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Upload session files, supporting assets, and structured courses.</h1>
          <p className="text-gray-600 max-w-3xl">
            Admins can now attach uploaded videos, PDFs, images, and supporting files, keep an external URL when available, and build course-style content with ordered modules.
          </p>
        </section>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm p-3 rounded-xl">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Metric label="Total Users" value={dashboard?.totalUsers ?? "-"} />
          <Metric label="Library Content" value={dashboard?.totalContent ?? "-"} />
          <Metric label="Completed Sessions" value={dashboard?.completedSessions ?? "-"} />
          <Metric label="Certificates Issued" value={dashboard?.totalCertificates ?? "-"} />
        </section>

        <section className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Upload CME Content</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title" value={form.title} onChange={(value) => handleChange("title", value)} />
              <Input label="Speaker" value={form.speaker} onChange={(value) => handleChange("speaker", value)} />
              <Input label="Discipline" value={form.discipline} onChange={(value) => handleChange("discipline", value)} />
              <Input label="Topic" value={form.topic} onChange={(value) => handleChange("topic", value)} />
              <Input label="Keywords" value={form.keywords} onChange={(value) => handleChange("keywords", value)} placeholder="ELISA, PCR, Blood Transfusion" />
              <Input label="Event Date" value={form.eventDate} onChange={(value) => handleChange("eventDate", value)} type="date" />

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Content Type</span>
                <select
                  value={form.contentType}
                  onChange={(e) => handleChange("contentType", e.target.value)}
                  className="border px-3 py-3 rounded-xl text-sm"
                >
                  <option value="video">Recorded video</option>
                  <option value="pdf">Slide deck or PDF</option>
                  <option value="notes">Notes and summary</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Learning Mode</span>
                <select
                  value={form.learningMode}
                  onChange={(e) => handleChange("learningMode", e.target.value)}
                  className="border px-3 py-3 rounded-xl text-sm"
                >
                  <option value="session">Single session</option>
                  <option value="course">Course with modules</option>
                </select>
              </label>

              <Input label="Credits" value={form.credits} onChange={(value) => handleChange("credits", value)} type="number" />

              <div className="sm:col-span-2">
                <Input label="External URL (optional)" value={form.fileUrl} onChange={(value) => handleChange("fileUrl", value)} />
              </div>
            </div>

            <label className="block mt-4 text-sm">
              <span className="text-gray-600">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="border px-3 py-3 rounded-xl text-sm w-full mt-2"
              />
            </label>

            <label className="block mt-4 text-sm">
              <span className="text-gray-600">Summary</span>
              <textarea
                value={form.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                rows={4}
                className="border px-3 py-3 rounded-xl text-sm w-full mt-2"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Primary file upload</span>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.ppt,.pptx"
                  onChange={(e) => handleChange("primaryAsset", e.target.files?.[0] || null)}
                  className="border px-3 py-3 rounded-xl text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Supporting files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.ppt,.pptx"
                  onChange={(e) => handleChange("attachments", e.target.files || [])}
                  className="border px-3 py-3 rounded-xl text-sm"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 mt-5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isLiveEvent}
                onChange={(e) => handleChange("isLiveEvent", e.target.checked)}
              />
              This is a live CME event that should later be archived
            </label>

            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Course Modules</h3>
                  <p className="text-sm text-gray-600">Use these when the content is a course rather than a single session.</p>
                </div>
                <button
                  type="button"
                  onClick={addModule}
                  className="border border-blue-200 text-blue-900 px-4 py-2 rounded-xl hover:bg-blue-50 text-sm"
                >
                  Add module
                </button>
              </div>

              <div className="space-y-4">
                {form.modules.map((module, index) => (
                  <div key={index} className="border rounded-2xl p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-medium text-gray-900">Module {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeModule(index)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <Input label="Module title" value={module.title} onChange={(value) => updateModule(index, "title", value)} />
                      <Input label="Resource URL (optional)" value={module.resourceUrl} onChange={(value) => updateModule(index, "resourceUrl", value)} />
                      <label className="block text-sm">
                        <span className="text-gray-600">Module reading content</span>
                        <textarea
                          value={module.content}
                          onChange={(e) => updateModule(index, "content", e.target.value)}
                          rows={5}
                          className="border px-3 py-3 rounded-xl text-sm w-full mt-2"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                {form.modules.length === 0 && (
                  <p className="text-sm text-gray-500">No modules added yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full mt-6 bg-blue-900 text-white py-3 rounded-xl hover:bg-blue-800 transition"
            >
              {loading ? "Uploading..." : "Upload Content"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
              <div className="space-y-3 text-sm">
                {(dashboard?.recentUsers || []).map((user) => (
                  <div key={user._id} className="border rounded-2xl p-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-gray-500 mt-1">{user.email}</p>
                  </div>
                ))}
                {(dashboard?.recentUsers || []).length === 0 && (
                  <p className="text-gray-500">No user records available.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
              <div className="space-y-3 text-sm">
                {content.map((item) => (
                  <div key={item._id} className="border rounded-2xl p-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-500 mt-1">
                      {item.discipline || "Discipline not set"} | {item.learningMode || "session"}
                    </p>
                    {(item.primaryAsset?.url || item.fileUrl) && (
                      <a
                        href={resolveAssetUrl(item.primaryAsset?.url || item.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-cyan-700"
                      >
                        Open resource
                      </a>
                    )}
                  </div>
                ))}
                {content.length === 0 && (
                  <p className="text-gray-500">No content uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white p-5 rounded-3xl border shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-blue-950 mt-2">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border px-3 py-3 rounded-xl text-sm"
      />
    </label>
  );
}

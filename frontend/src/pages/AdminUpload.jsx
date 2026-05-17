import { useEffect, useState } from "react";
import API from "../services/api";

const emptyModule = { title: "", content: "", resourceUrl: "", estimatedMinutes: 5 };
const disciplines = [
  "Hematology",
  "Microbiology",
  "Chemistry",
  "Molecular Diagnostics",
  "Lab Management & Quality Assurance",
  "POCT",
  "Parasitology",
  "Lab Automation",
  "Bio Safety & Bio Security"
];

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
  minCompletionMinutes: 10,
  isLiveEvent: false,
  primaryAsset: null,
  thumbnailAsset: null,
  attachments: [],
  modules: []
};

export default function AdminUpload() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");

  const fetchAdminData = async () => {
    try {
      const contentData = await API.get("/content");
      setContent(Array.isArray(contentData) ? contentData : []);
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

  const totalModuleMinutes = form.modules.reduce(
    (total, module) => total + (Number(module.estimatedMinutes) || 0),
    0
  );

  const formatDateInput = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  };

  const startEditing = (item) => {
    setMessage("");
    setUploadSuccess(null);
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      discipline: item.discipline || "",
      topic: item.topic || "",
      speaker: item.speaker || "",
      summary: item.summary || "",
      keywords: Array.isArray(item.keywords) ? item.keywords.join(", ") : "",
      eventDate: formatDateInput(item.eventDate),
      fileUrl: item.fileUrl || "",
      contentType: item.contentType || "video",
      learningMode: item.learningMode || "session",
      credits: item.credits ?? 5,
      minCompletionMinutes: item.minCompletionMinutes ?? 10,
      isLiveEvent: Boolean(item.isLiveEvent),
      primaryAsset: null,
      thumbnailAsset: null,
      attachments: [],
      modules: (item.modules || []).map((module) => ({
        _id: module._id,
        title: module.title || "",
        content: module.content || "",
        resourceUrl: module.resourceUrl || "",
        estimatedMinutes: module.estimatedMinutes || 5
      }))
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setMessage("");
  };

  const submit = async () => {
    if (!form.title || !form.contentType) {
      setUploadSuccess(null);
      setMessage("Title and content type are required");
      return;
    }

    if (
      !editingId &&
      form.learningMode === "session" &&
      !form.fileUrl &&
      !form.primaryAsset &&
      form.attachments.length === 0
    ) {
      setUploadSuccess(null);
      setMessage("Add an upload or external URL for a session");
      return;
    }

    if (form.learningMode === "course" && form.modules.length === 0) {
      setUploadSuccess(null);
      setMessage("Add at least one module for a course");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setUploadSuccess(null);

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
      payload.append("minCompletionMinutes", String(Number(form.minCompletionMinutes)));
      payload.append("isLiveEvent", String(form.isLiveEvent));
      payload.append("modules", JSON.stringify(form.modules));

      if (form.primaryAsset) {
        payload.append("primaryAsset", form.primaryAsset);
      }

      if (form.thumbnailAsset) {
        payload.append("thumbnailAsset", form.thumbnailAsset);
      }

      Array.from(form.attachments).forEach((file) => {
        payload.append("attachments", file);
      });

      const requestConfig = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      const uploadedContent = editingId
        ? await API.put(`/content/${editingId}`, payload, requestConfig)
        : await API.post("/content", payload, requestConfig);

      setUploadSuccess({
        id: uploadedContent?._id || "",
        title: uploadedContent?.title || form.title,
        contentType: uploadedContent?.contentType || form.contentType,
        action: editingId ? "updated" : "added"
      });
      setForm(emptyForm);
      setEditingId("");
      await fetchAdminData();
    } catch (err) {
      setUploadSuccess(null);
      setMessage(err?.message || (editingId ? "Update failed" : "Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  const deleteContentItem = async (contentId) => {
    try {
      setDeletingId(contentId);
      setMessage("");
      await API.delete(`/content/${contentId}`);
      if (editingId === contentId) {
        resetForm();
      }
      setMessage("Content deleted successfully");
      await fetchAdminData();
    } catch (err) {
      setMessage(err?.message || "Could not delete content");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-8">
      {uploadSuccess && (
        <UploadSuccessDialog
          upload={uploadSuccess}
          onClose={() => setUploadSuccess(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        <section className="bg-white border rounded-2xl shadow-sm p-5 sm:rounded-3xl sm:p-8">
          <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-2 sm:mb-3">Admin Dashboard</p>
          <h1 className="text-2xl font-semibold leading-tight text-gray-900 mb-2 sm:mb-3 sm:text-3xl">Upload session files, supporting assets, and structured courses.</h1>
          <p className="text-sm text-gray-600 max-w-3xl sm:text-base">
            Admins can now attach uploaded videos, PDFs, images, and supporting files, keep an external URL when available, and build course-style content with ordered modules.
          </p>
        </section>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm p-3 rounded-xl">
            {message}
          </div>
        )}

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  {editingId ? "Edit CME Content" : "Upload CME Content"}
                </h2>
                {editingId && (
                  <p className="mt-1 text-sm text-blue-900">
                    Editing existing content. Add modules below, then save changes.
                  </p>
                )}
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Input label="Title" value={form.title} onChange={(value) => handleChange("title", value)} />
              <Input label="Speaker" value={form.speaker} onChange={(value) => handleChange("speaker", value)} />
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Discipline</span>
                <select
                  value={form.discipline}
                  onChange={(e) => handleChange("discipline", e.target.value)}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
                >
                  <option value="">Select discipline</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline} value={discipline}>
                      {discipline}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Topic" value={form.topic} onChange={(value) => handleChange("topic", value)} />
              <Input label="Keywords" value={form.keywords} onChange={(value) => handleChange("keywords", value)} placeholder="ELISA, PCR, Blood Transfusion" />
              <Input label="Event Date" value={form.eventDate} onChange={(value) => handleChange("eventDate", value)} type="date" />

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Content Type</span>
                <select
                  value={form.contentType}
                  onChange={(e) => handleChange("contentType", e.target.value)}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
                >
                  <option value="video">Recorded video</option>
                  <option value="pdf">Slide deck or PDF</option>
                  <option value="document">Word document or PowerPoint</option>
                  <option value="notes">Notes and summary</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Learning Mode</span>
                <select
                  value={form.learningMode}
                  onChange={(e) => handleChange("learningMode", e.target.value)}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
                >
                  <option value="session">Single session</option>
                  <option value="course">Course with modules</option>
                </select>
              </label>

              <Input label="Credits" value={form.credits} onChange={(value) => handleChange("credits", value)} type="number" />
              {form.learningMode === "session" ? (
                <Input
                  label="Minimum learning time (minutes)"
                  value={form.minCompletionMinutes}
                  onChange={(value) => handleChange("minCompletionMinutes", value)}
                  type="number"
                />
              ) : (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
                  <span className="block text-gray-600">Total course learning time</span>
                  <span className="mt-1 block font-medium">
                    {totalModuleMinutes || 0} minutes from module timings
                  </span>
                </div>
              )}

              <div className="col-span-2">
                <Input label="External URL (optional)" value={form.fileUrl} onChange={(value) => handleChange("fileUrl", value)} />
              </div>
            </div>

            <label className="block mt-4 text-sm">
              <span className="text-gray-600">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="border px-3 py-2.5 rounded-xl text-sm w-full mt-2 sm:py-3"
              />
            </label>

            <label className="block mt-4 text-sm">
              <span className="text-gray-600">Summary</span>
              <textarea
                value={form.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                rows={3}
                className="border px-3 py-2.5 rounded-xl text-sm w-full mt-2 sm:py-3"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2 sm:gap-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Thumbnail / course graphic</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange("thumbnailAsset", e.target.files?.[0] || null)}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Primary file upload</span>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleChange("primaryAsset", e.target.files?.[0] || null)}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-gray-600">Supporting files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleChange("attachments", e.target.files || [])}
                  className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
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

            <div className="mt-6 border-t pt-5 sm:mt-8 sm:pt-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Course Modules</h3>
                  <p className="hidden text-sm text-gray-600 sm:block">Use these when the content is a course rather than a single session.</p>
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
                  <div key={index} className="border rounded-2xl p-3 bg-gray-50 sm:p-4">
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
                      <Input
                        label="Estimated learning time (minutes)"
                        value={module.estimatedMinutes}
                        onChange={(value) => updateModule(index, "estimatedMinutes", value)}
                        type="number"
                      />
                      <label className="block text-sm">
                        <span className="text-gray-600">Module reading content</span>
                        <textarea
                          value={module.content}
                          onChange={(e) => updateModule(index, "content", e.target.value)}
                          rows={5}
                        className="border px-3 py-2.5 rounded-xl text-sm w-full mt-2 sm:py-3"
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
              {loading
                ? editingId ? "Saving..." : "Uploading..."
                : editingId ? "Save Changes" : "Upload Content"}
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border shadow-sm sm:p-6 sm:rounded-3xl">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold sm:text-xl">Manage Uploaded Content</h2>
                  <p className="hidden text-sm text-gray-500 mt-1 sm:block">Review, open, and delete uploaded sessions and courses.</p>
                </div>
                <p className="text-sm text-gray-500">{content.length} items</p>
              </div>
              <div className="space-y-3 text-sm">
                {content.map((item) => (
                  <div key={item._id} className="border rounded-2xl p-3 sm:p-4">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-500 mt-1">
                      {item.discipline || "Discipline not set"} | {item.learningMode || "session"}
                    </p>
                    {item.learningMode === "course" && (
                      <p className="mt-1 text-xs text-gray-500">
                        {(item.modules || []).length} modules
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      <a
                        href={`/content/${item._id}`}
                        className="inline-flex text-cyan-700"
                      >
                        View content
                      </a>
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="inline-flex text-blue-900"
                      >
                        Edit / add modules
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteContentItem(item._id)}
                        disabled={deletingId === item._id}
                        className="inline-flex text-red-600 disabled:text-red-300"
                      >
                        {deletingId === item._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
                {content.length === 0 && (
                  <p className="text-gray-500">No content uploaded yet.</p>
                )}
              </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", className = "" }) {
  return (
    <label className={`flex flex-col gap-2 text-sm ${className}`}>
      <span className="text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border px-3 py-2.5 rounded-xl text-sm sm:py-3"
      />
    </label>
  );
}

function UploadSuccessDialog({ upload, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload complete</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {upload.title} has been {upload.action === "updated" ? "updated" : "added"} in the CME library.
        </p>
        <p className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Type: {upload.contentType || "content"}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {upload.id && (
            <a
              href={`/content/${upload.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800"
            >
              View content
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Upload another
          </button>
        </div>
      </div>
    </div>
  );
}

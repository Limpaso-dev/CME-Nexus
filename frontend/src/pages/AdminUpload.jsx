import { useState } from "react";
import API from "../services/api";

export default function AdminUpload() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    discipline: "",
    topic: "",
    speaker: "",
    fileUrl: "",
    credits: 5
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submit = async () => {
    if (!form.title || !form.fileUrl) {
      return setMessage("Title and File URL are required");
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/content", form);

      setMessage("Content uploaded successfully");

      // reset form
      setForm({
        title: "",
        description: "",
        discipline: "",
        topic: "",
        speaker: "",
        fileUrl: "",
        credits: 5
      });

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-6">

      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border">

        <h2 className="text-xl sm:text-2xl font-semibold mb-6">
          Upload CME Content
        </h2>

        {message && (
          <p className="text-sm mb-4 text-center text-gray-700">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />

          <input
            placeholder="Speaker"
            value={form.speaker}
            onChange={(e) => handleChange("speaker", e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />

          <input
            placeholder="Discipline"
            value={form.discipline}
            onChange={(e) => handleChange("discipline", e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />

          <input
            placeholder="Topic"
            value={form.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />

          <input
            placeholder="File URL"
            value={form.fileUrl}
            onChange={(e) => handleChange("fileUrl", e.target.value)}
            className="border px-3 py-2 rounded text-sm col-span-1 sm:col-span-2"
          />

          <input
            type="number"
            placeholder="Credits"
            value={form.credits}
            onChange={(e) => handleChange("credits", e.target.value)}
            className="border px-3 py-2 rounded text-sm"
          />
        </div>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full mt-4"
          rows={4}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-6 bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          {loading ? "Uploading..." : "Upload Content"}
        </button>

      </div>
    </div>
  );
}
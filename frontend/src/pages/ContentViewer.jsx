import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function ContentViewer() {
  const { id } = useParams();

  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentRes = await API.get("/content");
        const found = contentRes.data.find(c => c._id === id);
        setContent(found);

        const discussionRes = await API.get(`/discussions/${id}`);
        setComments(discussionRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const markComplete = async () => {
    try {
      await API.post("/progress/complete", { contentId: id });
      alert("Completed. Credits awarded.");
    } catch (err) {
      console.error(err);
    }
  };

  const postComment = async () => {
    if (!message.trim()) return;

    try {
      await API.post("/discussions", {
        contentId: id,
        message
      });

      setMessage("");

      const res = await API.get(`/discussions/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4 sm:p-6">Loading...</p>;
  if (!content) return <p className="p-4 sm:p-6">Content not found</p>;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">

      {/* TITLE */}
      <h1 className="text-lg sm:text-xl font-semibold mb-4">
        {content.title}
      </h1>

      {/* MEDIA */}
      {content.contentType === "video" && (
        <video controls className="w-full mb-6 rounded">
          <source src={content.fileUrl} />
        </video>
      )}

      {content.contentType === "pdf" && (
        <iframe
          src={content.fileUrl}
          className="w-full h-[300px] sm:h-[500px] mb-6 border rounded"
        />
      )}

      {content.contentType === "notes" && (
        <a
          href={content.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-600 underline text-sm"
        >
          Open Notes
        </a>
      )}

      {/* COMPLETE BUTTON */}
      <button
        onClick={markComplete}
        className="w-full sm:w-auto bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition mb-8"
      >
        Mark as Completed
      </button>

      {/* DISCUSSION */}
      <div className="mt-6 sm:mt-8">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">
          Discussion
        </h3>

        {/* INPUT */}
        <div className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="border w-full px-3 py-2 rounded mb-2 text-sm resize-none"
            placeholder="Ask a question or share insight..."
          />

          <button
            onClick={postComment}
            className="w-full sm:w-auto bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm"
          >
            Post
          </button>
        </div>

        {/* COMMENTS */}
        <div className="space-y-3 sm:space-y-4">
          {comments.map(c => (
            <div
              key={c._id}
              className="border rounded p-3 bg-white text-xs sm:text-sm"
            >
              <p className="font-medium text-gray-900">
                {c.userId?.name || "User"}
              </p>

              <p className="text-gray-600 mt-1">
                {c.message}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-gray-500 text-sm">
              No discussions yet.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
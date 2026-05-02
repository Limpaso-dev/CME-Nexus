import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API, { resolveAssetUrl } from "../services/api";

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString();
};

export default function ContentViewer() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [progress, setProgress] = useState(null);

  const fetchDiscussion = async () => {
    const discussionRes = await API.get(`/discussions/${id}`);
    setComments(Array.isArray(discussionRes) ? discussionRes : []);
  };

  const fetchProgress = async () => {
    const progressRes = await API.get("/progress/mine");
    const current = Array.isArray(progressRes)
      ? progressRes.find((entry) => entry.contentId?._id === id)
      : null;
    setProgress(current || null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentRes] = await Promise.all([
          API.get(`/content/${id}`),
          fetchDiscussion(),
          fetchProgress()
        ]);
        setContent(contentRes);
      } catch (err) {
        setFeedback(err?.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const moduleIds = useMemo(
    () => (content?.modules || []).map((module) => String(module._id)),
    [content]
  );

  const completedModuleIds = progress?.completedModuleIds || [];
  const allModulesRead = moduleIds.length === 0 || moduleIds.every((moduleId) => completedModuleIds.includes(moduleId));
  const primaryResourceUrl = resolveAssetUrl(content?.primaryAsset?.url || content?.fileUrl);

  const markComplete = async () => {
    try {
      const res = await API.post("/progress/complete", { contentId: id });
      setFeedback(
        res.alreadyCompleted
          ? "This content is already marked as completed."
          : `Completed successfully. ${res.awardedCredits} credits added.`
      );
      await fetchProgress();
    } catch (err) {
      setFeedback(err?.message || "Could not mark content as complete");
    }
  };

  const markModuleRead = async (moduleId) => {
    try {
      await API.post("/progress/module", {
        contentId: id,
        moduleId
      });
      await fetchProgress();
      setFeedback("Module marked as read.");
    } catch (err) {
      setFeedback(err?.message || "Could not update module progress");
    }
  };

  const postComment = async () => {
    if (!message.trim()) {
      return;
    }

    try {
      await API.post("/discussions", {
        contentId: id,
        message
      });
      setMessage("");
      await fetchDiscussion();
    } catch (err) {
      setFeedback(err?.message || "Could not post discussion message");
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!content) {
    return <p className="p-6">Content not found</p>;
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <section className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
          <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-3">
            {content.discipline || "CME Content"} | {content.learningMode || "session"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-3">{content.title}</h1>
          <p className="text-gray-600 mb-6">{content.description || content.summary || "No session summary available."}</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
            <Meta label="Topic" value={content.topic} />
            <Meta label="Speaker" value={content.speaker} />
            <Meta label="Session Date" value={formatDate(content.eventDate)} />
            <Meta label="Credits" value={`${content.credits} CME`} />
            <Meta label="Type" value={content.contentType} />
            <Meta label="Progress" value={`${progress?.percentComplete || 0}%`} />
          </div>

          {content.learningMode === "course" && content.modules.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              {content.modules.map((module, index) => {
                const moduleId = String(module._id);
                const isRead = completedModuleIds.includes(moduleId);

                return (
                  <div key={moduleId} className="rounded-2xl border bg-gray-50 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Module {index + 1}</p>
                        <h3 className="font-semibold text-gray-900 mt-1">{module.title}</h3>
                      </div>
                      <button
                        onClick={() => markModuleRead(moduleId)}
                        disabled={isRead}
                        className={`px-4 py-2 rounded-xl text-sm ${
                          isRead
                            ? "bg-green-100 text-green-800"
                            : "bg-cyan-500 text-blue-950 hover:bg-cyan-400"
                        }`}
                      >
                        {isRead ? "Read" : "Mark as read"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 leading-6 mt-4 whitespace-pre-wrap">
                      {module.content || "No module reading text provided."}
                    </p>

                    {module.resourceUrl && (
                      <a
                        href={resolveAssetUrl(module.resourceUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-4 text-cyan-700"
                      >
                        Open module resource
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mb-6">
              {content.contentType === "video" && primaryResourceUrl && (
                <video controls className="w-full mb-6 rounded-2xl bg-black">
                  <source src={primaryResourceUrl} />
                </video>
              )}

              {content.contentType === "pdf" && primaryResourceUrl && (
                <iframe
                  src={primaryResourceUrl}
                  className="w-full h-[420px] sm:h-[560px] mb-6 border rounded-2xl"
                  title={content.title}
                />
              )}

              {content.contentType === "notes" && primaryResourceUrl && (
                <div className="rounded-2xl bg-gray-50 border p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-3">This session is provided as notes or summary material.</p>
                  <a
                    href={primaryResourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800"
                  >
                    Open notes
                  </a>
                </div>
              )}
            </div>
          )}

          {content.attachments?.length > 0 && (
            <div className="rounded-2xl border p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Supporting Files</h3>
              <div className="space-y-2 text-sm">
                {content.attachments.map((asset, index) => (
                  <a
                    key={`${asset.url}-${index}`}
                    href={resolveAssetUrl(asset.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-cyan-700"
                  >
                    {asset.originalName || `Attachment ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={markComplete}
              disabled={content.learningMode === "course" && !allModulesRead}
              className={`px-5 py-3 rounded-xl transition ${
                content.learningMode === "course" && !allModulesRead
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
            >
              Mark as completed
            </button>
            {primaryResourceUrl && (
              <a
                href={primaryResourceUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-blue-200 text-blue-900 px-5 py-3 rounded-xl hover:bg-blue-50 transition text-center"
              >
                Open primary resource
              </a>
            )}
          </div>

          {feedback && (
            <div className="mt-4 text-sm rounded-xl bg-blue-50 text-blue-900 border border-blue-100 px-4 py-3">
              {feedback}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-2">Discussion / Q&amp;A</h2>
          <p className="text-sm text-gray-600 mb-5">
            Ask questions, discuss cases, and interact around the learning material.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="border w-full px-3 py-3 rounded-xl mb-3 text-sm resize-none"
            placeholder="Ask a question or share an insight..."
          />

          <button
            onClick={postComment}
            className="w-full bg-cyan-500 text-blue-950 px-4 py-3 rounded-xl hover:bg-cyan-400 text-sm font-medium"
          >
            Post discussion
          </button>

          <div className="space-y-4 mt-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border rounded-2xl p-4 bg-gray-50 text-sm">
                <p className="font-medium text-gray-900">{comment.userId?.name || "User"}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                <p className="text-gray-700 mt-3 leading-6">{comment.message}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-gray-500 text-sm">No discussions yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-2xl border bg-gray-50 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className="text-gray-800">{value || "Not set"}</p>
    </div>
  );
}

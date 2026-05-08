import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API, { resolveAssetUrl } from "../services/api";

const TRACKING_INTERVAL_SECONDS = 15;

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString();
};

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  if (!minutes) {
    return `${remainder}s`;
  }

  if (!remainder) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainder}s`;
};

export default function ContentViewer() {
  const { id } = useParams();
  const role = localStorage.getItem("role");
  const isAdminViewer = role === "admin";
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [activeReplyId, setActiveReplyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [progress, setProgress] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState("");

  const fetchDiscussion = async () => {
    const discussionRes = await API.get(`/discussions/${id}`);
    setComments(Array.isArray(discussionRes) ? discussionRes : []);
  };

  const fetchProgress = async () => {
    if (isAdminViewer) {
      setProgress(null);
      return;
    }

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
  const hasPrimaryResource = Boolean(primaryResourceUrl);
  const requiredSessionSeconds = (content?.minCompletionMinutes || 10) * 60;
  const sessionSecondsSpent = progress?.engagementSeconds || 0;

  useEffect(() => {
    if (isAdminViewer || !content || content.learningMode !== "course" || activeModuleId) {
      return;
    }

    const preferredModuleId = progress?.lastReadModuleId || moduleIds[0] || "";
    if (preferredModuleId) {
      setActiveModuleId(preferredModuleId);
    }
  }, [activeModuleId, content, isAdminViewer, moduleIds, progress?.lastReadModuleId]);

  useEffect(() => {
    if (isAdminViewer || !content) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        if (content.learningMode === "course") {
          if (!activeModuleId || completedModuleIds.includes(activeModuleId)) {
            return;
          }

          const res = await API.post("/progress/module", {
            contentId: id,
            moduleId: activeModuleId,
            seconds: TRACKING_INTERVAL_SECONDS
          });
          setProgress(res.progress || null);
          return;
        }

        if (progress?.completed) {
          return;
        }

        const res = await API.post("/progress/engagement", {
          contentId: id,
          seconds: TRACKING_INTERVAL_SECONDS
        });
        setProgress(res.progress || null);
      } catch (err) {
        setFeedback(err?.message || "Could not track learning progress");
      }
    }, TRACKING_INTERVAL_SECONDS * 1000);

    return () => window.clearInterval(timer);
  }, [activeModuleId, completedModuleIds, content, id, isAdminViewer, progress?.completed]);

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

  const postReply = async (parentId) => {
    const replyMessage = replyDrafts[parentId]?.trim();
    if (!replyMessage) {
      return;
    }

    try {
      await API.post("/discussions", {
        contentId: id,
        parentId,
        message: replyMessage
      });
      setReplyDrafts((current) => ({ ...current, [parentId]: "" }));
      setActiveReplyId("");
      await fetchDiscussion();
    } catch (err) {
      setFeedback(err?.message || "Could not post reply");
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
          {(content.thumbnailAsset?.url || content.primaryAsset?.resourceType === "image") && (
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border bg-slate-100 aspect-[16/8]">
              <img
                src={resolveAssetUrl(content.thumbnailAsset?.url || content.primaryAsset?.url)}
                alt={content.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

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
            {!isAdminViewer && <Meta label="Progress" value={`${progress?.percentComplete || 0}%`} />}
          </div>

          {!isAdminViewer && (
            <div className="rounded-2xl border bg-slate-50 p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Learning progress</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Credits unlock only after the required engagement time is met.
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {progress?.percentComplete || 0}% complete
                </span>
              </div>
              <div className="h-3 rounded-full bg-white border overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-900 transition-all"
                  style={{ width: `${progress?.percentComplete || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {content.learningMode === "course"
                  ? "Complete each module's guided learning time before claiming CME credit."
                  : `Required learning time: ${content.minCompletionMinutes || 10} minutes. Tracked so far: ${formatDuration(sessionSecondsSpent)}.`}
              </p>
            </div>
          )}

          {isAdminViewer && (
            <div className="rounded-2xl border bg-slate-50 p-5 mb-6">
              <h2 className="font-semibold text-gray-900">Admin preview</h2>
              <p className="text-sm text-gray-600 mt-2">
                This account can review course content, but learner progress, credits, and completion are disabled for admins.
              </p>
            </div>
          )}

          {content.learningMode === "course" && content.modules.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              {content.modules.map((module, index) => {
                const moduleId = String(module._id);
                const isRead = completedModuleIds.includes(moduleId);
                const moduleProgress = progress?.moduleProgress?.find((entry) => entry.moduleId === moduleId);
                const requiredModuleSeconds = (module.estimatedMinutes || 5) * 60;
                const trackedModuleSeconds = moduleProgress?.secondsSpent || 0;
                const modulePercent = Math.min(
                  100,
                  Math.round((trackedModuleSeconds / requiredModuleSeconds) * 100)
                );
                const isActive = activeModuleId === moduleId;

                return (
                  <div key={moduleId} className="rounded-2xl border bg-gray-50 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Module {index + 1}</p>
                        <h3 className="font-semibold text-gray-900 mt-1">{module.title}</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Required time: {module.estimatedMinutes || 5} min
                        </p>
                      </div>
                      {!isAdminViewer && (
                        <button
                          onClick={() => setActiveModuleId(moduleId)}
                          className={`px-4 py-2 rounded-xl text-sm ${
                            isActive
                              ? "bg-blue-900 text-white"
                              : isRead
                                ? "bg-green-100 text-green-800"
                                : "bg-cyan-500 text-blue-950 hover:bg-cyan-400"
                          }`}
                        >
                          {isActive ? "Tracking now" : isRead ? "Completed" : "Start learning"}
                        </button>
                      )}
                    </div>

                    {!isAdminViewer && (
                      <div className="mt-4">
                        <div className="h-2 rounded-full bg-white border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-900 transition-all"
                            style={{ width: `${modulePercent}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {formatDuration(trackedModuleSeconds)} of {formatDuration(requiredModuleSeconds)} tracked
                        </p>
                      </div>
                    )}

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
            {!isAdminViewer && (
              <button
                onClick={markComplete}
                disabled={
                  content.learningMode === "course"
                    ? !allModulesRead
                    : sessionSecondsSpent < requiredSessionSeconds
                }
                className={`px-5 py-3 rounded-xl transition ${
                  ((content.learningMode === "course" && !allModulesRead) ||
                    (content.learningMode !== "course" && sessionSecondsSpent < requiredSessionSeconds))
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800"
                }`}
              >
                Mark as completed
              </button>
            )}
            {content.contentType === "pdf" ? (
              <a
                href={hasPrimaryResource ? primaryResourceUrl : undefined}
                target={hasPrimaryResource ? "_blank" : undefined}
                rel={hasPrimaryResource ? "noreferrer" : undefined}
                download={hasPrimaryResource ? true : undefined}
                aria-disabled={!hasPrimaryResource}
                className={`px-5 py-3 rounded-xl transition text-center ${
                  hasPrimaryResource
                    ? "border border-blue-200 text-blue-900 hover:bg-blue-50"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                Download PDF
              </a>
            ) : content.contentType === "notes" ? (
              <a
                href={hasPrimaryResource ? primaryResourceUrl : undefined}
                target={hasPrimaryResource ? "_blank" : undefined}
                rel={hasPrimaryResource ? "noreferrer" : undefined}
                aria-disabled={!hasPrimaryResource}
                className={`px-5 py-3 rounded-xl transition text-center ${
                  hasPrimaryResource
                    ? "border border-blue-200 text-blue-900 hover:bg-blue-50"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                Open notes
              </a>
            ) : null}
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

          {!isAdminViewer && (
            <>
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
            </>
          )}

          {isAdminViewer && (
            <div className="rounded-2xl border bg-slate-50 px-4 py-4 text-sm text-gray-600">
              Admin accounts can review the discussion thread here, but posting is disabled in preview mode.
            </div>
          )}

          <div className="space-y-4 mt-6">
            {comments.map((comment) => (
              <DiscussionThread
                key={comment._id}
                comment={comment}
                isAdminViewer={isAdminViewer}
                activeReplyId={activeReplyId}
                setActiveReplyId={setActiveReplyId}
                replyDrafts={replyDrafts}
                setReplyDrafts={setReplyDrafts}
                onReply={postReply}
              />
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

function DiscussionThread({
  comment,
  isAdminViewer,
  activeReplyId,
  setActiveReplyId,
  replyDrafts,
  setReplyDrafts,
  onReply,
  depth = 0
}) {
  const isReplying = activeReplyId === comment._id;
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  const replyDraft = replyDrafts[comment._id] || "";

  return (
    <div className={`${depth > 0 ? "ml-4 sm:ml-8 mt-3" : ""}`}>
      <div className="border rounded-2xl p-4 bg-gray-50 text-sm">
        <p className="font-medium text-gray-900">{comment.userId?.name || "User"}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
        <p className="text-gray-700 mt-3 leading-6">{comment.message}</p>

        {!isAdminViewer && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setActiveReplyId(isReplying ? "" : comment._id)}
              className="text-cyan-700 hover:underline"
            >
              {isReplying ? "Cancel reply" : "Reply"}
            </button>
          </div>
        )}

        {!isAdminViewer && isReplying && (
          <div className="mt-4 rounded-2xl border bg-white p-3">
            <textarea
              value={replyDraft}
              onChange={(e) =>
                setReplyDrafts((current) => ({
                  ...current,
                  [comment._id]: e.target.value
                }))
              }
              rows={3}
              className="border w-full px-3 py-3 rounded-xl text-sm resize-none"
              placeholder="Write a direct reply..."
            />
            <button
              type="button"
              onClick={() => onReply(comment._id)}
              className="mt-3 bg-cyan-500 text-blue-950 px-4 py-2 rounded-xl hover:bg-cyan-400 text-sm font-medium"
            >
              Post reply
            </button>
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <DiscussionThread
              key={reply._id}
              comment={reply}
              isAdminViewer={isAdminViewer}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

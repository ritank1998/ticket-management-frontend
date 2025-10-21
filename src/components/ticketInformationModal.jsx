import { useState, useEffect } from "react";
import Portal from "./portal";

const TicketModal = ({ ticket, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch all comments when modal opens
  useEffect(() => {
    if (!ticket?.ticket_id) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/all-comment?ticket_id=${ticket.ticket_id}`
        );
        const data = await res.json();

        // Normalize data to always be an array
        if (Array.isArray(data)) {
          setComments(data);
        } else if (data.comment) {
          setComments([data.comment]);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [ticket]);

  // Add new comment (POST)
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!ticket?.ticket_id || !user?.user_id) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          user_id: user.user_id,
          comment_text: newComment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Backend returns { comment: {...} }, normalize to array
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      } else {
        console.error("Failed to add comment:", data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Add reply locally (not persisted yet)
  const handleAddReply = (commentId, replyMessage) => {
    if (!replyMessage.trim()) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c.comment_id === commentId || c.id === commentId) {
          const reply = {
            id: Date.now(),
            user_id: user?.user_id,
            user_email: user?.email,
            message: replyMessage,
          };
          return { ...c, replies: [...(c.replies || []), reply] };
        }
        return c;
      })
    );
  };

  if (!ticket) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>

          {/* Ticket Details */}
          <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">Project</h6>
              <p>{ticket.project_name || "Not Assigned"}</p>
            </div>
            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">Status</h6>
              <p>{ticket.status}</p>
            </div>
            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">
                Description
              </h6>
              <p>{ticket.ticket_description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-1">Comments</h3>

            {/* New Comment Input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                onClick={handleAddComment}
              >
                Add
              </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.comment_id || comment.id}
                    comment={comment}
                    addReply={handleAddReply}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm">No comments yet.</p>
              )}
            </div>
          </div>

          {/* OK button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

// Comment component
const CommentItem = ({ comment, addReply }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = () => {
    addReply(comment.comment_id || comment.id, replyMessage);
    setReplyMessage("");
    setShowReplyInput(false);
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <p className="text-sm font-medium text-gray-800">
        {comment.user_email || "Anonymous"}
      </p>
      <p className="text-gray-700 text-sm mb-2">
        {comment.comment_text || comment.message}
      </p>

      <button
        className="text-blue-600 text-xs mb-2"
        onClick={() => setShowReplyInput(!showReplyInput)}
      >
        Reply
      </button>

      {showReplyInput && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Write a reply..."
            className="flex-1 border rounded-lg px-2 py-1 text-sm"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            onClick={handleReply}
          >
            Reply
          </button>
        </div>
      )}

      {comment.replies &&
        Array.isArray(comment.replies) &&
        comment.replies.length > 0 && (
          <div className="ml-4 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="border-l-2 border-gray-300 pl-3">
                <p className="text-sm font-medium text-gray-800">
                  {reply.user_email || "Anonymous"}
                </p>
                <p className="text-gray-700 text-sm">{reply.message}</p>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default TicketModal;

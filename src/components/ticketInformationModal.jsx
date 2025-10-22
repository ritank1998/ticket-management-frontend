import { useState, useEffect } from "react";
import Portal from "./portal";

const TicketModal = ({ ticket, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState(ticket?.status || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

  // 🧠 Fetch Comments
  useEffect(() => {
    if (!ticket?.ticket_id) return;

    const fetchComments = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/all-comment?ticket_id=${ticket.ticket_id}`
        );
        const data = await res.json();

        if (Array.isArray(data)) setComments(data);
        else if (data.comment) setComments([data.comment]);
        else setComments([]);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [ticket]);

  // 💬 Add Comment
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
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // 🆙 Update Ticket Status
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    if (!newStatus || !ticket?.ticket_id || !user?.user_id) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          new_status: newStatus,
          changed_by: user.user_id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Ticket status updated to "${newStatus}"`);
      } else {
        alert(`❌ Failed to update status: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Server error while updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 🧩 Add reply (local only)
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-lg w-full max-w-lg sm:max-h-[90vh] overflow-y-auto p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ❌ Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>

          {/* 🧾 Ticket Details */}
          <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">
            Ticket Details
          </h2>

          <div className="space-y-3 text-gray-700">
            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">Project</h6>
              <p>{ticket.project_name || "Not Assigned"}</p>
            </div>

            {/* ✅ Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-300"
                value={status}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <option value="">Select Status</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Resolved">Resolved</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">
                Description
              </h6>
              <p className="break-words">{ticket.ticket_description}</p>
            </div>
          </div>

          {/* 💬 Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-1">
              Comments
            </h3>

            {/* Responsive Add Comment Input */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
                onClick={handleAddComment}
              >
                Add
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
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

          {/* OK Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg w-full sm:w-auto"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

// 🧱 Comment Component
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
      <p className="text-gray-700 text-sm mb-2 break-words">
        {comment.comment_text || comment.message}
      </p>

      <button
        className="text-blue-600 text-xs mb-2"
        onClick={() => setShowReplyInput(!showReplyInput)}
      >
        Reply
      </button>

      {showReplyInput && (
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
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

      {comment.replies?.length > 0 && (
        <div className="ml-4 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="border-l-2 border-gray-300 pl-3">
              <p className="text-sm font-medium text-gray-800">
                {reply.user_email || "Anonymous"}
              </p>
              <p className="text-gray-700 text-sm break-words">
                {reply.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketModal;

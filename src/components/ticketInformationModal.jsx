import { useState } from "react";
import Portal from "./portal";

const TicketModal = ({ ticket, onClose }) => {
  // ✅ Hooks must be at the top
  const [comments, setComments] = useState(ticket?.comments || []);
  const [newComment, setNewComment] = useState("");

  // Add new comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: "You", // Replace with logged-in user
      message: newComment,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  // Add reply to a comment
  const handleAddReply = (commentId, replyMessage) => {
    if (!replyMessage.trim()) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const reply = { id: Date.now(), user: "You", message: replyMessage };
          return { ...c, replies: [...c.replies, reply] };
        }
        return c;
      })
    );
  };

  if (!ticket) return null; // Conditional render after hooks

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
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
              <h6 className="text-gray-400 uppercase text-xs mb-1">Description</h6>
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
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    addReply={handleAddReply}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

// Nested Comment Item
const CommentItem = ({ comment, addReply }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = () => {
    addReply(comment.id, replyMessage);
    setReplyMessage("");
    setShowReplyInput(false);
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <p className="text-sm font-medium text-gray-800">{comment.user}</p>
      <p className="text-gray-700 text-sm mb-2">{comment.message}</p>

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

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="border-l-2 border-gray-300 pl-3">
              <p className="text-sm font-medium text-gray-800">{reply.user}</p>
              <p className="text-gray-700 text-sm">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketModal;

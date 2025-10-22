import { useState, useEffect } from "react";

// Portal Component (assuming it's a simple portal)
const Portal = ({ children }) => {
  return children;
};

const TicketModal = ({ ticket, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState(ticket?.status || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [mentionList, setMentionList] = useState([]);
  const [showMentions, setShowMentions] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || '{"user_id": 1, "email": "test@example.com"}');

  // 🧠 Fetch comments
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
      } catch (err) {
        console.error("Error fetching comments:", err);
        setComments([]);
      }
    };

    fetchComments();
  }, [ticket]);

  // 💬 Add comment + trigger email if mentions found
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
        await handleMentionEmail(newComment);
        setNewComment("");
        setShowMentions(false);
      } else {
        alert("Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // ✉️ Handle mentions (trigger email)
  const handleMentionEmail = async (commentText) => {
    if (!commentText.includes("@")) return;

    const mentionedNames = Array.from(
      new Set(commentText.match(/@\w+/g)?.map((m) => m.substring(1).toLowerCase()) || [])
    );

    if (mentionedNames.length === 0) return;

    const mentionedUsers = projectUsers.filter((u) =>
      mentionedNames.includes(u.name?.toLowerCase())
    );

    if (mentionedUsers.length === 0) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/mention-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.ticket_id,
          mentioned_users: mentionedUsers.map((u) => ({
            email: u.email,
            name: u.name,
          })),
          comment_text: commentText,
          added_by: user?.email,
        }),
      });

      if (res.ok) console.log("📩 Mention email sent successfully.");
      else console.warn("⚠️ Failed to send mention emails.");
    } catch (err) {
      console.error("Error sending mention emails:", err);
    }
  };

  // 👂 Detect "@" and fetch project users
  const handleCommentChange = async (e) => {
    const value = e.target.value;
    setNewComment(value);

    console.log("=== handleCommentChange ===");
    console.log("Comment value:", value);
    console.log("Current projectUsers:", projectUsers);
    console.log("Current showMentions:", showMentions);
    console.log("Current mentionList:", mentionList);

    // Find the last @ symbol
    const lastAtIndex = value.lastIndexOf("@");
    console.log("Last @ index:", lastAtIndex);
    
    if (lastAtIndex === -1) {
      // No @ in the text
      console.log("No @ found, hiding mentions");
      setShowMentions(false);
      return;
    }

    // Get text after the last @
    const textAfterAt = value.substring(lastAtIndex + 1);
    console.log("Text after @:", textAfterAt);
    
    // If there's a space after @, the mention is complete
    if (textAfterAt.includes(" ")) {
      console.log("Space found after @, hiding mentions");
      setShowMentions(false);
      return;
    }

    // Fetch users if we don't have them yet
    if (projectUsers.length === 0) {
      try {
        console.log("Fetching project users..."); 
        const res = await fetch(
          `${process.env.REACT_APP_URL}/get-project-users?user_id=${user.user_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch project users");
        const data = await res.json();
        console.log("Raw API response:", data);
        console.log("Type of response:", typeof data);
        console.log("Is array?", Array.isArray(data));
        
        // Handle both array and object responses
        let usersArray = Array.isArray(data) ? data : (data.users || data || []);
        console.log("Converted to users array:", usersArray);
        console.log("Users array length:", usersArray.length);
        
        setProjectUsers(usersArray);
        
        // Filter based on current search
        const searchTerm = textAfterAt.toLowerCase();
        console.log("Search term:", searchTerm);
        const filtered = usersArray.filter((u) => {
          console.log("Checking user:", u);
          return u.name?.toLowerCase().includes(searchTerm);
        });
        console.log("Filtered users:", filtered);
        console.log("Filtered count:", filtered.length);
        setMentionList(filtered);
        console.log("Setting showMentions to TRUE");
        setShowMentions(true);
      } catch (err) {
        console.error("Error fetching project users:", err);
      }
    } else {
      console.log("Using cached users");
      // Filter existing users
      const searchTerm = textAfterAt.toLowerCase();
      console.log("Search term:", searchTerm);
      const filtered = Array.isArray(projectUsers) ? projectUsers.filter((u) => {
        console.log("Checking user:", u);
        return u.name?.toLowerCase().includes(searchTerm);
      }) : [];
      console.log("Filtered users:", filtered);
      console.log("Filtered count:", filtered.length);
      setMentionList(filtered);
      const shouldShow = filtered.length > 0;
      console.log("Setting showMentions to:", shouldShow);
      setShowMentions(shouldShow);
    }
    console.log("=== End handleCommentChange ===");
  };

  // 🧩 Insert mention into comment
  const handleSelectMention = (mentionName) => {
    const lastAtIndex = newComment.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const beforeAt = newComment.substring(0, lastAtIndex);
      const updated = beforeAt + `@${mentionName} `;
      setNewComment(updated);
    }
    setShowMentions(false);
  };

  // 🆙 Update ticket status
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
      if (res.ok) alert(`✅ Ticket status updated to "${newStatus}"`);
      else alert(`❌ Failed to update status: ${data.error}`);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 🧩 Add reply (local only)
  const handleAddReply = (commentId, replyMessage) => {
    if (!replyMessage.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c.comment_id === commentId || c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: Date.now(),
                  user_id: user?.user_id,
                  user_email: user?.email,
                  message: replyMessage,
                },
              ],
            }
          : c
      )
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
          className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ❌ Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">
            Ticket Details
          </h2>

          <div className="space-y-3 text-gray-700">
            <div>
              <h6 className="text-gray-400 uppercase text-xs mb-1">Project</h6>
              <p>{ticket.project_name || "Not Assigned"}</p>
            </div>

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

          {/* 💬 Comments */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-1">Comments</h3>

            <div className="mb-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 w-full">
                <div className="flex-1 relative w-full">
                  <input
                    type="text"
                    placeholder="Add a comment... (use @name to mention)"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={newComment}
                    onChange={handleCommentChange}
                    autoComplete="off"
                  />
                  
                  {/* 👇 Mention Dropdown - Directly under input */}
                  {showMentions && mentionList.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[100]">
                      {mentionList.map((u) => (
                        <li
                          key={u.user_id}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0 transition-colors"
                          onClick={() => handleSelectMention(u.name)}
                        >
                          <span className="font-medium text-blue-600">@{u.name}</span>
                          {u.email && (
                            <span className="text-gray-500 text-xs ml-2">({u.email})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  onClick={handleAddComment}
                >
                  Add
                </button>
              </div>
              
              {/* Debug info - remove after testing */}
              {showMentions && (
                <div className="text-xs text-gray-500 mt-1">
                  Showing {mentionList.length} suggestions
                </div>
              )}
            </div>

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

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg w-full sm:w-auto hover:bg-blue-700 transition-colors"
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
        className="text-blue-600 text-xs mb-2 hover:text-blue-800"
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
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
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
              <p className="text-gray-700 text-sm break-words">{reply.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketModal;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminMessages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingMessageId, setUpdatingMessageId] =
    useState("");

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        if (response.status === 403) {
          setError(
            data.message ||
              "You do not have permission to view contact messages."
          );
          return;
        }

        setError(
          data.message ||
            "Unable to load contact messages."
        );
        return;
      }

      setMessages(data.contactMessages || data.messages || []);
    } catch (error) {
      console.error(
        "Contact messages loading error:",
        error
      );

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [navigate]);

  const markAsRead = async (messageId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const message = messages.find(
      (item) => item._id === messageId
    );

    if (!message) {
      return;
    }

    if (message.status === "read") {
      return;
    }

    setError("");
    setSuccessMessage("");
    setUpdatingMessageId(messageId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact/${messageId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "read",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        if (response.status === 403) {
          setError(
            data.message ||
              "You do not have permission to update this message."
          );
          return;
        }

        setError(
          data.message ||
            "Unable to mark this message as read."
        );
        return;
      }

      const updatedMessage =
        data.message || data.contactMessage;

      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item._id === messageId
            ? {
                ...item,
                ...(updatedMessage || {}),
                status:
                  updatedMessage?.status || "read",
              }
            : item
        )
      );

      setSuccessMessage(
        data.messageText ||
          data.successMessage ||
          "Message marked as read successfully."
      );
    } catch (error) {
      console.error(
        "Mark message as read error:",
        error
      );

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setUpdatingMessageId("");
    }
  };

  const getStatusClass = (status) => {
    if (status === "read") {
      return "admin-message-status admin-message-status-read";
    }

    return "admin-message-status admin-message-status-unread";
  };

  const getStatusLabel = (status) => {
    return status === "read" ? "Read" : "Unread";
  };

  const getDisplayDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDisplayDateTime = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter(
    (message) => message.status !== "read"
  ).length;

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              CONTACT MESSAGES
            </span>

            <h1>Messages</h1>

            <p>
              Review messages submitted through the
              SkillBridge contact form.
            </p>
          </div>
        </div>

        {successMessage && (
          <div
            className="admin-success-message"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div className="dashboard-error" role="alert">
            <h2>Unable to process request</h2>

            <p>{error}</p>

            <button
              type="button"
              className="admin-retry-button"
              onClick={fetchMessages}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-users-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                INBOX
              </span>

              <h2>Contact Messages</h2>
            </div>

            <div className="admin-message-summary">
              <span className="admin-record-count">
                {loading
                  ? "Loading..."
                  : `${messages.length} ${
                      messages.length === 1
                        ? "message"
                        : "messages"
                    }`}
              </span>

              {!loading && unreadCount > 0 && (
                <span className="admin-unread-count">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading messages...</p>
            </div>
          )}

          {!loading &&
            !error &&
            messages.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  M
                </div>

                <h2>No messages yet</h2>

                <p>
                  There are currently no contact messages
                  to display.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            messages.length > 0 && (
              <div className="admin-messages-list">
                {messages.map((message) => {
                  const isUnread =
                    message.status !== "read";

                  const isUpdating =
                    updatingMessageId ===
                    message._id;

                  return (
                    <article
                      className={
                        isUnread
                          ? "admin-message-card admin-message-card-unread"
                          : "admin-message-card admin-message-card-read"
                      }
                      key={message._id}
                    >
                      <div className="admin-message-card-header">
                        <div className="admin-message-sender">
                          <div className="admin-message-avatar">
                            {message.name
                              ? message.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "M"}
                          </div>

                          <div>
                            <h3>
                              {message.name ||
                                "Name unavailable"}
                            </h3>

                            <a
                              href={`mailto:${
                                message.email || ""
                              }`}
                              className="admin-message-email"
                            >
                              {message.email ||
                                "Email unavailable"}
                            </a>
                          </div>
                        </div>

                        <span
                          className={getStatusClass(
                            message.status
                          )}
                        >
                          {getStatusLabel(
                            message.status
                          )}
                        </span>
                      </div>

                      <div className="admin-message-content">
                        <span>Message</span>

                        <p>
                          {message.message ||
                            "No message content available."}
                        </p>
                      </div>

                      <div className="admin-message-footer">
                        <div className="admin-message-date">
                          <span>
                            Received
                          </span>

                          <strong>
                            {getDisplayDate(
                              message.createdAt
                            )}
                          </strong>

                          <small>
                            {getDisplayDateTime(
                              message.createdAt
                            )}
                          </small>
                        </div>

                        {isUnread && (
                          <button
                            type="button"
                            className="admin-mark-read-button"
                            onClick={() =>
                              markAsRead(
                                message._id
                              )
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating
                              ? "Marking..."
                              : "Mark as Read"}
                          </button>
                        )}

                        {!isUnread && (
                          <span className="admin-message-read-label">
                            ✓ Already read
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>
      </section>
    </main>
  );
}

export default AdminMessages;


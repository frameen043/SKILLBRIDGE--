
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState("");

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications`,
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

        setError(
          data.message || "Unable to load your notifications."
        );
        return;
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Notifications error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");

    if (!token || !notificationId) {
      return;
    }

    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification || notification.isRead || markingId) {
      return;
    }

    try {
      setMarkingId(notificationId);

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
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

        setError(
          data.message || "Unable to mark notification as read."
        );
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item._id === notificationId
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);

      setError(
        "Unable to update the notification. Please try again."
      );
    } finally {
      setMarkingId("");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatNotificationType = (type) => {
    if (!type) {
      return "Notification";
    }

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
  };

  const getNotificationRoute = (notification) => {
    const relatedId = notification.relatedId;
    const relatedModel = notification.relatedModel;

    if (!relatedId || !relatedModel) {
      return null;
    }

    const normalizedModel = String(relatedModel).toLowerCase();

    /*
      Only use routes that already exist in SkillBridge.

      Request-related notifications can safely point to the
      existing customer request details page when the related
      model is Request.

      Service-related notifications can point to the existing
      service details page.

      Other notification types remain non-clickable because
      we do not invent routes.
    */

    if (normalizedModel === "request") {
      return `/customer/requests/${relatedId}`;
    }

    if (normalizedModel === "service") {
      return `/services/${relatedId}`;
    }

    return null;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const route = getNotificationRoute(notification);

    if (route) {
      navigate(route);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <main className="notifications-page">
      <section className="notifications-container">
        <div className="notifications-header">
          <div>
            <span className="dashboard-eyebrow">
              ACCOUNT ACTIVITY
            </span>

            <h1>Notifications</h1>

            <p>
              Stay up to date with your requests, account
              activity, and other SkillBridge updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="notifications-unread-summary">
              {unreadCount} unread
            </div>
          )}
        </div>

        {error && (
          <div
            className="dashboard-error"
            role="alert"
          >
            <h2>Unable to load notifications</h2>

            <p>{error}</p>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={fetchNotifications}
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="dashboard-state">
            <div className="dashboard-loader"></div>

            <p>Loading your notifications...</p>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="dashboard-empty notifications-empty">
              <div className="dashboard-empty-icon">
                N
              </div>

              <h2>No notifications yet</h2>

              <p>
                You don't have any notifications yet.
              </p>
            </div>
          )}

        {!loading &&
          notifications.length > 0 && (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const route =
                  getNotificationRoute(notification);

                const isUnread = !notification.isRead;
                const isMarking =
                  markingId === notification._id;

                const notificationContent = (
                  <>
                    <div className="notification-icon">
                      {isUnread ? "!" : "✓"}
                    </div>

                    <div className="notification-content">
                      <div className="notification-top">
                        <span className="notification-type">
                          {formatNotificationType(
                            notification.type
                          )}
                        </span>

                        {isUnread && (
                          <span className="notification-unread-label">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="notification-message">
                        {notification.message ||
                          "You have a new notification."}
                      </p>

                      <div className="notification-bottom">
                        <span className="notification-date">
                          {formatDate(
                            notification.createdAt ||
                              notification.updatedAt
                          )}
                        </span>

                        {isUnread && (
                          <button
                            type="button"
                            className="notification-read-button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();

                              markAsRead(
                                notification._id
                              );
                            }}
                            disabled={isMarking}
                          >
                            {isMarking
                              ? "Updating..."
                              : "Mark as read"}
                          </button>
                        )}

                        {route && (
                          <span className="notification-view-label">
                            View details →
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );

                if (route) {
                  return (
                    <Link
                      key={notification._id}
                      to={route}
                      className={`notification-card ${
                        isUnread
                          ? "notification-card-unread"
                          : "notification-card-read"
                      }`}
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                    >
                      {notificationContent}
                    </Link>
                  );
                }

                return (
                  <article
                    key={notification._id}
                    className={`notification-card ${
                      isUnread
                        ? "notification-card-unread"
                        : "notification-card-read"
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    {notificationContent}
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}

export default Notifications;


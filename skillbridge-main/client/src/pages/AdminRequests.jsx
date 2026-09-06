
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/admin`,
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
              "You do not have permission to view requests."
          );
          return;
        }

        setError(
          data.message || "Unable to load requests."
        );
        return;
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Admin requests loading error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const getCustomerName = (request) => {
    if (
      request.customerId &&
      typeof request.customerId === "object"
    ) {
      return (
        request.customerId.name ||
        "Customer unavailable"
      );
    }

    if (
      request.customer &&
      typeof request.customer === "object"
    ) {
      return (
        request.customer.name ||
        "Customer unavailable"
      );
    }

    return "Customer unavailable";
  };

  const getCustomerEmail = (request) => {
    if (
      request.customerId &&
      typeof request.customerId === "object"
    ) {
      return request.customerId.email || "";
    }

    if (
      request.customer &&
      typeof request.customer === "object"
    ) {
      return request.customer.email || "";
    }

    return "";
  };

  const getProviderName = (request) => {
    if (
      request.providerId &&
      typeof request.providerId === "object"
    ) {
      return (
        request.providerId.name ||
        "Provider unavailable"
      );
    }

    if (
      request.provider &&
      typeof request.provider === "object"
    ) {
      return (
        request.provider.name ||
        "Provider unavailable"
      );
    }

    return "Provider unavailable";
  };

  const getProviderEmail = (request) => {
    if (
      request.providerId &&
      typeof request.providerId === "object"
    ) {
      return request.providerId.email || "";
    }

    if (
      request.provider &&
      typeof request.provider === "object"
    ) {
      return request.provider.email || "";
    }

    return "";
  };

  const getServiceTitle = (request) => {
    if (
      request.serviceId &&
      typeof request.serviceId === "object"
    ) {
      return (
        request.serviceId.title ||
        "Service unavailable"
      );
    }

    if (
      request.service &&
      typeof request.service === "object"
    ) {
      return (
        request.service.title ||
        "Service unavailable"
      );
    }

    if (typeof request.serviceTitle === "string") {
      return request.serviceTitle;
    }

    return "Service unavailable";
  };

  const getMessage = (request) => {
    return (
      request.message ||
      request.description ||
      request.details ||
      "No message provided."
    );
  };

  const getStatusClass = (status) => {
    if (status === "pending") {
      return "admin-request-status admin-request-status-pending";
    }

    if (status === "accepted") {
      return "admin-request-status admin-request-status-accepted";
    }

    if (status === "rejected") {
      return "admin-request-status admin-request-status-rejected";
    }

    if (status === "in progress") {
      return "admin-request-status admin-request-status-progress";
    }

    if (status === "completed") {
      return "admin-request-status admin-request-status-completed";
    }

    return "admin-request-status";
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );
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

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              REQUEST MONITORING
            </span>

            <h1>Service Requests</h1>

            <p>
              Monitor customer service requests and their
              current status across the SkillBridge
              marketplace.
            </p>
          </div>
        </div>

        {error && (
          <div className="dashboard-error" role="alert">
            <h2>Unable to load requests</h2>

            <p>{error}</p>

            <button
              type="button"
              className="admin-retry-button"
              onClick={fetchRequests}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-users-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                MARKETPLACE ACTIVITY
              </span>

              <h2>All Requests</h2>
            </div>

            <span className="admin-record-count">
              {loading
                ? "Loading..."
                : `${requests.length} ${
                    requests.length === 1
                      ? "request"
                      : "requests"
                  }`}
            </span>
          </div>

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading requests...</p>
            </div>
          )}

          {!loading &&
            !error &&
            requests.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  R
                </div>

                <h2>No requests yet</h2>

                <p>
                  There are currently no service requests
                  to monitor.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            requests.length > 0 && (
              <div className="admin-request-list">
                {requests.map((request) => {
                  const customerName =
                    getCustomerName(request);

                  const customerEmail =
                    getCustomerEmail(request);

                  const providerName =
                    getProviderName(request);

                  const providerEmail =
                    getProviderEmail(request);

                  const serviceTitle =
                    getServiceTitle(request);

                  const message =
                    getMessage(request);

                  return (
                    <article
                      className="admin-request-card"
                      key={request._id}
                    >
                      <div className="admin-request-card-header">
                        <div>
                          <span className="admin-request-label">
                            SERVICE REQUEST
                          </span>

                          <h3>
                            {serviceTitle}
                          </h3>
                        </div>

                        <span
                          className={getStatusClass(
                            request.status
                          )}
                        >
                          {getStatusLabel(
                            request.status
                          )}
                        </span>
                      </div>

                      <div className="admin-request-details-grid">
                        <div className="admin-request-detail">
                          <span>Customer</span>

                          <strong>
                            {customerName}
                          </strong>

                          {customerEmail && (
                            <small>
                              {customerEmail}
                            </small>
                          )}
                        </div>

                        <div className="admin-request-detail">
                          <span>Provider</span>

                          <strong>
                            {providerName}
                          </strong>

                          {providerEmail && (
                            <small>
                              {providerEmail}
                            </small>
                          )}
                        </div>

                        <div className="admin-request-detail">
                          <span>Service</span>

                          <strong>
                            {serviceTitle}
                          </strong>
                        </div>

                        <div className="admin-request-detail">
                          <span>Created</span>

                          <strong>
                            {getDisplayDate(
                              request.createdAt
                            )}
                          </strong>

                          <small>
                            {getDisplayDateTime(
                              request.createdAt
                            )}
                          </small>
                        </div>
                      </div>

                      <div className="admin-request-message">
                        <span>Message / Details</span>

                        <p>{message}</p>
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

export default AdminRequests;


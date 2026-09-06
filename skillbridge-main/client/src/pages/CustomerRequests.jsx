import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CustomerRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerRequests = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/requests/my-requests",
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
            data.message ||
              "Unable to load your service requests."
          );

          return;
        }

        setRequests(data.requests || []);
      } catch (error) {
        console.error("Customer requests error:", error);

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerRequests();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <main className="customer-dashboard">
      <section className="customer-dashboard-container">
        <div className="customer-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              CUSTOMER ACTIVITY
            </span>

            <h1>My Requests</h1>

            <p>
              View all of your service requests and track their
              current status.
            </p>
          </div>

          <Link
            to="/services"
            className="dashboard-services-button"
          >
            Browse Services
          </Link>
        </div>

        {loading && (
          <div className="dashboard-state">
            <div className="dashboard-loader"></div>

            <p>Loading your requests...</p>
          </div>
        )}

        {!loading && error && (
          <div
            className="dashboard-error"
            role="alert"
          >
            <h2>Unable to load requests</h2>

            <p>{error}</p>

            <Link
              to="/customer/dashboard"
              className="dashboard-primary-button"
            >
              Return to Dashboard
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          requests.length === 0 && (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                S
              </div>

              <h2>No requests yet</h2>

              <p>
                You have not submitted any service requests
                yet. Browse available services to get started.
              </p>

              <Link
                to="/services"
                className="dashboard-primary-button"
              >
                Browse Services
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          requests.length > 0 && (
            <div className="customer-requests-grid">
              {requests.map((request) => (
                <article
                  className="customer-request-card"
                  key={request._id}
                >
                  {request.serviceId?.imageUrl ? (
                    <img
                      src={request.serviceId.imageUrl}
                      alt={request.serviceId.title}
                      className="customer-request-image"
                    />
                  ) : (
                    <div className="customer-request-image-placeholder">
                      SkillBridge Service
                    </div>
                  )}

                  <div className="customer-request-content">
                    <div className="customer-request-top">
                      <div>
                        <span className="customer-request-category">
                          {request.serviceId?.category ||
                            "Service"}
                        </span>

                        <h2>
                          {request.serviceId?.title ||
                            "Service unavailable"}
                        </h2>
                      </div>

                      <span
                        className={`request-status request-status-${request.status}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </div>

                    <div className="provider-request-service-info">
                      <div>
                        <span>Provider</span>

                        <strong>
                          {request.providerId?.name ||
                            "Provider unavailable"}
                        </strong>
                      </div>

                      <div>
                        <span>Request Date</span>

                        <strong>
                          {formatDate(request.createdAt)}
                        </strong>
                      </div>
                    </div>

                    {request.serviceId?.price !==
                      undefined && (
                      <div className="provider-request-service-info">
                        <div>
                          <span>Service Price</span>

                          <strong>
                            {request.serviceId.price}
                          </strong>
                        </div>

                        {request.providerId?.email && (
                          <div>
                            <span>Provider Email</span>

                            <strong>
                              {request.providerId.email}
                            </strong>
                          </div>
                        )}
                      </div>
                    )}

                    {request.message && (
                      <div className="provider-request-message">
                        <span className="provider-section-label">
                          Your Request Message
                        </span>

                        <p>{request.message}</p>
                      </div>
                    )}

                    <Link
                      to={`/customer/requests/${request._id}`}
                      className="dashboard-primary-button"
                    >
                      View Request Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}

export default CustomerRequests;
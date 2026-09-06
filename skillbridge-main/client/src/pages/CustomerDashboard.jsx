import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRequests = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
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
          setError(
            data.message || "Unable to load your service requests."
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

    fetchMyRequests();
  }, []);

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

  return (
    <main className="customer-dashboard">
      <section className="customer-dashboard-container">
        <div className="customer-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              CUSTOMER DASHBOARD
            </span>

            <h1>My Service Requests</h1>

            <p>
              Track the services you have requested and check their current
              status.
            </p>
          </div>

          <Link to="/services" className="dashboard-services-button">
            Explore Services
          </Link>
        </div>

        {loading && (
          <div className="dashboard-state">
            <div className="dashboard-loader"></div>
            <p>Loading your service requests...</p>
          </div>
        )}

        {!loading && error && (
          <div className="dashboard-error" role="alert">
            <h2>Unable to load requests</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">S</div>

            <h2>No service requests yet</h2>

            <p>
              You haven't submitted any service requests yet. Explore available
              services and connect with a skilled provider.
            </p>

            <Link to="/services" className="dashboard-primary-button">
              Find Services
            </Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
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
                    SkillBridge
                  </div>
                )}

                <div className="customer-request-content">
                  <div className="customer-request-top">
                    <span className="customer-request-category">
                      {request.serviceId?.category || "Service"}
                    </span>

                    <span
                      className={`request-status request-status-${request.status}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <h2>
                    {request.serviceId?.title || "Service unavailable"}
                  </h2>

                  <p className="customer-request-price">
                    {request.serviceId?.price !== undefined
                      ? `Price: ${request.serviceId.price}`
                      : "Price unavailable"}
                  </p>

                  <div className="customer-request-details">
                    <div>
                      <span>Provider</span>
                      <strong>
                        {request.providerId?.name ||
                          "Provider unavailable"}
                      </strong>
                    </div>

                    <div>
                      <span>Request Date</span>
                      <strong>{formatDate(request.createdAt)}</strong>
                    </div>
                  </div>

                  {request.message && (
                    <div className="customer-request-message">
                      <span>Your Message</span>
                      <p>{request.message}</p>
                    </div>
                  )}

                  {/* View existing CustomerRequestDetails page */}
                  <Link
                    to={`/customer/requests/${request._id}`}
                    className="customer-request-details-button"
                  >
                    View Details
                    <span aria-hidden="true">→</span>
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

export default CustomerDashboard;
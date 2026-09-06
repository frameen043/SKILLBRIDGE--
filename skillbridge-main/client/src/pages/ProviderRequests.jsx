import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function ProviderRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        setError(data.message || "Unable to load incoming service requests.");
        return;
      }

      setRequests(data.requests || []);
    } catch (requestError) {
      console.error("Incoming requests error:", requestError);
      setError("Unable to connect to the SkillBridge server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setSuccessMessage("");
    setUpdatingRequestId(requestId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
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
        setError(data.message || "Unable to update the request status.");
        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? { ...request, ...data.request } : request
        )
      );

      if (selectedRequest?._id === requestId) {
        setSelectedRequest((currentRequest) => ({
          ...currentRequest,
          ...data.request,
        }));
      }

      setSuccessMessage(data.message || "Request status updated successfully.");
    } catch (requestError) {
      console.error("Update request status error:", requestError);
      setError("Unable to connect to the SkillBridge server. Please try again.");
    } finally {
      setUpdatingRequestId("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleString(undefined, {
      year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  };

  const statusLabel = (status) => {
    const labels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return labels[status] || status || "Unknown";
  };

  const renderActions = (request) => {
    const busy = updatingRequestId === request._id;
    if (request.status === "pending") {
      return <div className="provider-request-actions">
        <button type="button" className="provider-accept-button" onClick={() => updateRequestStatus(request._id, "accepted")} disabled={busy}>{busy ? "Updating..." : "Accept"}</button>
        <button type="button" className="provider-reject-button" onClick={() => updateRequestStatus(request._id, "rejected")} disabled={busy}>{busy ? "Updating..." : "Reject"}</button>
      </div>;
    }
    if (request.status === "accepted") {
      return <div className="provider-request-actions">
        <button type="button" className="provider-progress-button" onClick={() => updateRequestStatus(request._id, "in_progress")} disabled={busy}>{busy ? "Updating..." : "Start In Progress"}</button>
      </div>;
    }
    if (request.status === "in_progress") {
      return <div className="provider-request-actions">
        <button type="button" className="provider-complete-button" onClick={() => updateRequestStatus(request._id, "completed")} disabled={busy}>{busy ? "Updating..." : "Mark Completed"}</button>
      </div>;
    }
    return null;
  };

  return (
    <main className="provider-requests-page">
      <section className="provider-requests-container">
        <header className="provider-requests-header">
          <div>
            <span className="dashboard-eyebrow">REQUEST MANAGEMENT</span>
            <h1>Incoming Requests</h1>
            <p>Review customer requests, view request details, and move requests through their existing service workflow.</p>
          </div>
          <Link to="/provider/services" className="provider-services-button">Manage Services</Link>
        </header>

        {successMessage && <div className="provider-request-success" role="status">{successMessage}</div>}

        {!loading && error && <div className="dashboard-error" role="alert"><h2>Unable to load requests</h2><p>{error}</p><button type="button" className="dashboard-primary-button" onClick={loadRequests}>Try Again</button></div>}

        {loading && <div className="dashboard-state"><div className="dashboard-loader" /><p>Loading incoming requests...</p></div>}

        {!loading && !error && requests.length === 0 && (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">S</div>
            <h2>No incoming requests yet</h2>
            <p>Customer requests for your services will appear here when they arrive.</p>
            <Link to="/provider/services" className="dashboard-primary-button">Manage My Services</Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="provider-requests-grid">
            {requests.map((request) => (
              <article className="provider-request-card" key={request._id}>
                <div className="provider-request-top">
                  <div>
                    <span className="provider-request-category">{request.serviceId?.category || "Service"}</span>
                    <h2>{request.serviceId?.title || "Service unavailable"}</h2>
                  </div>
                  <span className={`request-status status-${request.status}`}>{statusLabel(request.status)}</span>
                </div>

                <div className="provider-request-summary">
                  <span><strong>Customer:</strong> {request.customerId?.name || "Customer unavailable"}</span>
                  <span><strong>Received:</strong> {formatDate(request.createdAt)}</span>
                </div>

                <div className="provider-request-card-footer">
                  <button type="button" className="provider-request-details-button" onClick={() => setSelectedRequest(request)}>View Details</button>
                  {renderActions(request)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedRequest && (
        <div className="provider-request-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRequest(null)}>
          <section className="provider-request-modal" role="dialog" aria-modal="true" aria-labelledby="provider-request-details-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="provider-request-modal-close" aria-label="Close request details" onClick={() => setSelectedRequest(null)}>×</button>
            <span className="dashboard-eyebrow">REQUEST DETAILS</span>
            <h2 id="provider-request-details-title">{selectedRequest.serviceId?.title || "Service request"}</h2>
            <span className={`request-status status-${selectedRequest.status}`}>{statusLabel(selectedRequest.status)}</span>

            <div className="provider-request-details-grid">
              <div><span>Customer</span><strong>{selectedRequest.customerId?.name || "Customer unavailable"}</strong></div>
              <div><span>Customer Email</span><strong>{selectedRequest.customerId?.email || "Email unavailable"}</strong></div>
              <div><span>Category</span><strong>{selectedRequest.serviceId?.category || "Unavailable"}</strong></div>
              <div><span>Price</span><strong>{selectedRequest.serviceId?.price ?? "Price unavailable"}</strong></div>
              <div><span>Created</span><strong>{formatDate(selectedRequest.createdAt)}</strong></div>
              {selectedRequest.updatedAt && <div><span>Last Updated</span><strong>{formatDate(selectedRequest.updatedAt)}</strong></div>}
            </div>

            {selectedRequest.serviceId?.description && <div className="provider-request-detail-block"><span>Service Description</span><p>{selectedRequest.serviceId.description}</p></div>}
            {selectedRequest.message && <div className="provider-request-detail-block"><span>Customer Message</span><p>{selectedRequest.message}</p></div>}

            <div className="provider-request-modal-actions">{renderActions(selectedRequest)}</div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ProviderRequests;

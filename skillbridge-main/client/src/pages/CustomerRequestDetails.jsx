import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import ReviewForm from "../components/ReviewForm";

function CustomerRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Review states
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewCheckError, setReviewCheckError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const response = await fetch(
          `http://localhost:5000/api/requests/my-requests/${id}`,
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

          if (
            response.status === 403 ||
            response.status === 404
          ) {
            setNotFound(true);

            setError(
              data.message ||
                "This request could not be found or accessed."
            );

            return;
          }

          setError(
            data.message ||
              "Unable to load request details."
          );

          return;
        }

        setRequest(data.request);
      } catch (error) {
        console.error(
          "Customer request details error:",
          error
        );

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, navigate]);

  // Check whether this completed request has already been reviewed
  useEffect(() => {
    const checkExistingReview = async () => {
      if (
        !request ||
        request.status !== "completed" ||
        !request.serviceId
      ) {
        return;
      }

      const serviceId =
        request.serviceId?._id || request.serviceId;

      if (!serviceId) {
        return;
      }

      try {
        setReviewLoading(true);
        setReviewCheckError("");

        const response = await fetch(
          `http://localhost:5000/api/reviews/service/${serviceId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to check review status."
          );
        }

        const reviews = Array.isArray(data.reviews)
          ? data.reviews
          : [];

        const existingReview = reviews.some((review) => {
          const reviewRequestId =
            review.requestId?._id ||
            review.requestId;

          return (
            String(reviewRequestId) ===
            String(request._id)
          );
        });

        setHasReviewed(existingReview);
      } catch (error) {
        console.error(
          "Review status check error:",
          error
        );

        // Do not block the request page if the review
        // status check fails. The backend still prevents
        // duplicate reviews.
        setReviewCheckError(
          "Unable to check your review status right now."
        );
      } finally {
        setReviewLoading(false);
      }
    };

    checkExistingReview();
  }, [request]);

  const formatDateTime = (date) => {
    if (!date) {
      return "Unavailable";
    }

    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
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

  const handleReviewSuccess = () => {
    setHasReviewed(true);
    setShowReviewForm(false);
    setReviewCheckError("");
  };

  const getServiceId = () => {
    return (
      request?.serviceId?._id ||
      request?.serviceId ||
      ""
    );
  };

  const getProviderId = () => {
    return (
      request?.providerId?._id ||
      request?.providerId ||
      ""
    );
  };

  return (
    <main className="customer-dashboard">
      <section className="customer-dashboard-container">
        <div className="customer-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              REQUEST DETAILS
            </span>

            <h1>Service Request</h1>

            <p>
              Review the complete information and current
              status of your service request.
            </p>
          </div>

          <Link
            to="/customer/requests"
            className="dashboard-services-button"
          >
            Back to Requests
          </Link>
        </div>

        {loading && (
          <div className="dashboard-state">
            <div className="dashboard-loader"></div>

            <p>Loading request details...</p>
          </div>
        )}

        {!loading && error && (
          <div
            className="dashboard-error"
            role="alert"
          >
            <h2>
              {notFound
                ? "Request unavailable"
                : "Unable to load request"}
            </h2>

            <p>{error}</p>

            <Link
              to="/customer/requests"
              className="dashboard-primary-button"
            >
              Back to My Requests
            </Link>
          </div>
        )}

        {!loading && !error && request && (
          <div className="customer-request-card">
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

              {request.serviceId?.description && (
                <div className="provider-request-message">
                  <span className="provider-section-label">
                    Service Description
                  </span>

                  <p>
                    {request.serviceId.description}
                  </p>
                </div>
              )}

              <div className="provider-request-service-info">
                <div>
                  <span>Service Price</span>

                  <strong>
                    {request.serviceId?.price !==
                    undefined
                      ? request.serviceId.price
                      : "Price unavailable"}
                  </strong>
                </div>

                <div>
                  <span>Current Status</span>

                  <strong>
                    {formatStatus(request.status)}
                  </strong>
                </div>
              </div>

              <div className="provider-customer-info">
                <span className="provider-section-label">
                  Provider Information
                </span>

                <div className="provider-customer-details">
                  <div>
                    <span>Name</span>

                    <strong>
                      {request.providerId?.name ||
                        "Provider unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>

                    <strong>
                      {request.providerId?.email ||
                        "Email unavailable"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="provider-request-message">
                <span className="provider-section-label">
                  Your Request Message
                </span>

                <p>
                  {request.message ||
                    "No additional message was provided."}
                </p>
              </div>

              <div className="provider-request-service-info">
                <div>
                  <span>Request Created</span>

                  <strong>
                    {formatDateTime(request.createdAt)}
                  </strong>
                </div>

                <div>
                  <span>Last Updated</span>

                  <strong>
                    {formatDateTime(request.updatedAt)}
                  </strong>
                </div>
              </div>

              {/* Review Section */}
              {request.status === "completed" && (
                <div className="request-review-section">
                  <span className="provider-section-label">
                    Service Review
                  </span>

                  {reviewLoading && (
                    <div className="dashboard-state">
                      <p>Checking review status...</p>
                    </div>
                  )}

                  {!reviewLoading && hasReviewed && (
                    <div className="reviewed-state">
                      <div className="reviewed-icon">
                        ★
                      </div>

                      <div>
                        <h3>Reviewed</h3>

                        <p>
                          You have already submitted a
                          review for this completed
                          service request.
                        </p>
                      </div>
                    </div>
                  )}

                  {!reviewLoading &&
                    !hasReviewed &&
                    !showReviewForm && (
                      <div className="leave-review-state">
                        <div>
                          <h3>How was your experience?</h3>

                          <p>
                            Your request is completed.
                            Share your experience with this
                            service and professional.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="dashboard-primary-button"
                          onClick={() =>
                            setShowReviewForm(true)
                          }
                        >
                          Leave a Review
                        </button>
                      </div>
                    )}

                  {!reviewLoading &&
                    !hasReviewed &&
                    showReviewForm && (
                      <ReviewForm
                        requestId={request._id}
                        serviceId={getServiceId()}
                        providerId={getProviderId()}
                        onSuccess={handleReviewSuccess}
                        onCancel={() =>
                          setShowReviewForm(false)
                        }
                      />
                    )}

                  {reviewCheckError && (
                    <p className="review-check-error">
                      {reviewCheckError}
                    </p>
                  )}
                </div>
              )}

              <Link
                to="/customer/requests"
                className="dashboard-primary-button"
              >
                Back to My Requests
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default CustomerRequestDetails;
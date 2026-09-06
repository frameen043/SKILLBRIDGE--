
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProviderDashboard() {
  const navigate = useNavigate();

  /* =========================
     INCOMING REQUESTS STATE
  ========================= */

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState("");

  /* =========================
     CREATE SERVICE STATE
  ========================= */

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    imageUrl: "",
  });

  const [creatingService, setCreatingService] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");

  /* =========================
     MY SERVICES STATE
  ========================= */

  const [myServices, setMyServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  /* =========================
     REVIEWS STATE - TASK 6
  ========================= */

  const [providerReviews, setProviderReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewsAverage, setReviewsAverage] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  /* =========================
     FETCH INCOMING REQUESTS
  ========================= */

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/requests/incoming",
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
            data.message || "Unable to load incoming service requests."
          );

          return;
        }

        setRequests(data.requests || []);
      } catch (error) {
        console.error("Incoming requests error:", error);

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingRequests();
  }, [navigate]);

  /* =========================
     FETCH PROVIDER SERVICES
  ========================= */

  const fetchMyServices = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setServicesLoading(true);
      setServicesError("");

      const response = await fetch(
        "http://localhost:5000/api/services/my-services",
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

        setServicesError(
          data.message || "Unable to load your services."
        );

        return;
      }

      setMyServices(data.services || []);
    } catch (error) {
      console.error("My services error:", error);

      setServicesError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  /* =========================
     FETCH PROVIDER REVIEWS
     TASK 6
  ========================= */

  useEffect(() => {
    const fetchProviderReviews = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError("");

        /*
          There is no separate provider-review endpoint.
          We reuse the existing:
          GET /api/reviews/service/:serviceId

          Each provider service is checked and its reviews
          are combined into one provider review list.
        */

        if (myServices.length === 0 && servicesLoading) {
          return;
        }

        if (myServices.length === 0) {
          setProviderReviews([]);
          setReviewsTotal(0);
          setReviewsAverage(0);
          setReviewsLoading(false);
          return;
        }

        const reviewResults = await Promise.all(
          myServices.map(async (service) => {
            try {
              const response = await fetch(
                `http://localhost:5000/api/reviews/service/${service._id}`
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message ||
                    `Unable to load reviews for ${service.title}.`
                );
              }

              return {
                service,
                reviews: data.reviews || [],
              };
            } catch (error) {
              console.error(
                `Reviews for service ${service._id} error:`,
                error
              );

              return {
                service,
                reviews: [],
              };
            }
          })
        );

        const combinedReviews = reviewResults.flatMap(
          ({ service, reviews }) =>
            reviews.map((review) => ({
              ...review,
              serviceTitle: service.title,
            }))
        );

        combinedReviews.sort((a, b) => {
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );
        });

        const total = combinedReviews.length;

        const average =
          total > 0
            ? combinedReviews.reduce(
                (sum, review) =>
                  sum + Number(review.rating || 0),
                0
              ) / total
            : 0;

        setProviderReviews(combinedReviews);
        setReviewsTotal(total);
        setReviewsAverage(average);
      } catch (error) {
        console.error("Provider reviews error:", error);

        setReviewsError(
          "Unable to load your reviews. Please try again."
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProviderReviews();
  }, [myServices, servicesLoading, navigate]);

  /* =========================
     SERVICE FORM CHANGE
  ========================= */

  const handleServiceChange = (event) => {
    const { name, value } = event.target;

    setServiceForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  /* =========================
     CREATE SERVICE
  ========================= */

  const createService = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setServiceError("");
    setServiceSuccess("");

    if (
      !serviceForm.title.trim() ||
      !serviceForm.description.trim() ||
      !serviceForm.category ||
      serviceForm.price === ""
    ) {
      setServiceError(
        "Please fill in all required service information."
      );

      return;
    }

    try {
      setCreatingService(true);

      const response = await fetch(
        "http://localhost:5000/api/services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: serviceForm.title.trim(),
            description: serviceForm.description.trim(),
            category: serviceForm.category,
            price: Number(serviceForm.price),
            imageUrl: serviceForm.imageUrl.trim(),
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

        setServiceError(
          data.message || "Unable to create your service."
        );

        return;
      }

      setServiceSuccess(
        data.message || "Service created successfully."
      );

      setServiceForm({
        title: "",
        description: "",
        category: "",
        price: "",
        imageUrl: "",
      });

      /* Refresh real services from backend */
      fetchMyServices();
    } catch (error) {
      console.error("Create service error:", error);

      setServiceError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setCreatingService(false);
    }
  };

  /* =========================
     UPDATE REQUEST STATUS
  ========================= */

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
        `http://localhost:5000/api/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
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

        setError(
          data.message || "Unable to update the request status."
        );

        return;
      }

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: data.request.status,
              }
            : request
        )
      );

      setSuccessMessage(
        data.message || `Request ${status} successfully.`
      );
    } catch (error) {
      console.error("Update request status error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setUpdatingRequestId("");
    }
  };

  /* =========================
     DATE FORMATTER
  ========================= */

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

  /* =========================
     REVIEW STAR DISPLAY
  ========================= */

  const renderReviewStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <span
        className="provider-review-stars"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= numericRating ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  return (
    <main className="provider-dashboard">
      <section className="provider-dashboard-container">

        {/* =========================
            DASHBOARD HEADER
        ========================= */}

        <div className="provider-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              PROVIDER DASHBOARD
            </span>

            <h1>Provider Workspace</h1>

            <p>
              Create your services and manage incoming customer requests.
            </p>
          </div>

          <Link
            to="/services"
            className="provider-services-button"
          >
            View Services
          </Link>
        </div>

        {/* =========================
            CREATE SERVICE
        ========================= */}

        <section className="provider-create-service">
          <div className="provider-create-service-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR SERVICES
              </span>

              <h2>Create a New Service</h2>

              <p>
                Add a service to the SkillBridge marketplace.
              </p>
            </div>
          </div>

          {serviceSuccess && (
            <div
              className="provider-service-success"
              role="status"
            >
              {serviceSuccess}
            </div>
          )}

          {serviceError && (
            <div
              className="provider-service-error"
              role="alert"
            >
              {serviceError}
            </div>
          )}

          <form
            className="provider-service-form"
            onSubmit={createService}
          >
            <div className="provider-service-field">
              <label htmlFor="title">
                Service Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={serviceForm.title}
                onChange={handleServiceChange}
                placeholder="Enter your service title"
                disabled={creatingService}
                required
              />
            </div>

            <div className="provider-service-field">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={serviceForm.category}
                onChange={handleServiceChange}
                disabled={creatingService}
                required
              >
                <option value="">
                  Select a category
                </option>

                <option value="Home Repair">
                  Home Repair
                </option>

                <option value="Cleaning">
                  Cleaning
                </option>

                <option value="Tutoring">
                  Tutoring
                </option>

                <option value="Tech Support">
                  Tech Support
                </option>

                <option value="Graphic Design">
                  Graphic Design
                </option>

                <option value="Web Development">
                  Web Development
                </option>

                <option value="Writing">
                  Writing
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="provider-service-field">
              <label htmlFor="price">
                Service Price
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={serviceForm.price}
                onChange={handleServiceChange}
                placeholder="Enter service price"
                disabled={creatingService}
                required
              />
            </div>

            <div className="provider-service-field">
              <label htmlFor="imageUrl">
                Image URL
              </label>

              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={serviceForm.imageUrl}
                onChange={handleServiceChange}
                placeholder="https://example.com/image.jpg"
                disabled={creatingService}
              />
            </div>

            <div className="provider-service-field provider-service-description-field">
              <label htmlFor="description">
                Service Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={serviceForm.description}
                onChange={handleServiceChange}
                placeholder="Describe what your service includes"
                disabled={creatingService}
                required
              />
            </div>

            <button
              type="submit"
              className="provider-create-service-button"
              disabled={creatingService}
            >
              {creatingService
                ? "Creating Service..."
                : "Create Service"}
            </button>
          </form>
        </section>

        {/* =========================
            MY SERVICES - STEP 14
        ========================= */}

        <section className="provider-my-services-section">
          <div className="provider-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR SERVICES
              </span>

              <h2>My Services</h2>

              <p>
                View all services you have created on SkillBridge.
              </p>
            </div>
          </div>

          {servicesLoading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading your services...</p>
            </div>
          )}

          {!servicesLoading && servicesError && (
            <div className="dashboard-error" role="alert">
              <h2>Unable to load services</h2>

              <p>{servicesError}</p>
            </div>
          )}

          {!servicesLoading &&
            !servicesError &&
            myServices.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  S
                </div>

                <h2>No services created yet</h2>

                <p>
                  You haven't created any services yet.
                  Use the form above to add your first
                  service to SkillBridge.
                </p>
              </div>
            )}

          {!servicesLoading &&
            !servicesError &&
            myServices.length > 0 && (
              <div className="provider-my-services-grid">
                {myServices.map((service) => (
                  <article
                    className="provider-my-service-card"
                    key={service._id}
                  >
                    {service.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="provider-my-service-image"
                      />
                    )}

                    <div className="provider-my-service-content">
                      <span className="provider-request-category">
                        {service.category || "Service"}
                      </span>

                      <h3>{service.title}</h3>

                      <p>
                        {service.description}
                      </p>

                      <div className="provider-my-service-bottom">
                        <strong>
                          {service.price !== undefined
                            ? service.price
                            : "Price unavailable"}
                        </strong>

                        <Link
                          to={`/services/${service._id}`}
                          className="provider-view-service-button"
                        >
                          View Service
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>

        {/* =========================
            PROVIDER REVIEWS - TASK 6
        ========================= */}

        <section className="provider-reviews-section">
          <div className="provider-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                CUSTOMER FEEDBACK
              </span>

              <h2>Reviews</h2>

              <p>
                See what customers have said about your services.
              </p>
            </div>
          </div>

          {reviewsLoading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading your reviews...</p>
            </div>
          )}

          {!reviewsLoading && reviewsError && (
            <div className="dashboard-error" role="alert">
              <h2>Unable to load reviews</h2>

              <p>{reviewsError}</p>
            </div>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviewsTotal > 0 && (
              <div
                className="provider-reviews-summary"
                style={{
                  marginBottom: "24px",
                  padding: "24px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "32px",
                      }}
                    >
                      {reviewsAverage.toFixed(1)}
                    </strong>

                    <div>
                      {renderReviewStars(reviewsAverage)}
                    </div>
                  </div>

                  <div>
                    <strong>
                      {reviewsTotal}{" "}
                      {reviewsTotal === 1
                        ? "review"
                        : "reviews"}
                    </strong>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#64748b",
                      }}
                    >
                      Across your services
                    </p>
                  </div>
                </div>
              </div>
            )}

          {!reviewsLoading &&
            !reviewsError &&
            reviewsTotal === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  ★
                </div>

                <h2>No reviews yet</h2>

                <p>
                  You haven't received any customer reviews yet.
                  Reviews for your completed services will appear
                  here.
                </p>
              </div>
            )}

          {!reviewsLoading &&
            !reviewsError &&
            providerReviews.length > 0 && (
              <div
                className="provider-reviews-grid"
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {providerReviews.map((review) => (
                  <article
                    className="provider-review-card"
                    key={review._id}
                    style={{
                      padding: "24px",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>
                          {review.customerId?.name ||
                            "SkillBridge Customer"}
                        </strong>

                        <div
                          style={{
                            marginTop: "6px",
                          }}
                        >
                          {renderReviewStars(review.rating)}
                        </div>
                      </div>

                      <time
                        dateTime={review.createdAt || ""}
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        {formatDate(review.createdAt)}
                      </time>
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        marginBottom: "12px",
                        fontSize: "14px",
                        color: "#64748b",
                      }}
                    >
                      Service:{" "}
                      <strong>
                        {review.serviceTitle ||
                          review.serviceId?.title ||
                          "Service"}
                      </strong>
                    </div>

                    {review.comment ? (
                      <p
                        style={{
                          margin: 0,
                          lineHeight: "1.7",
                          color: "#475569",
                        }}
                      >
                        {review.comment}
                      </p>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        No written comment was provided.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
        </section>

        {/* =========================
            INCOMING REQUESTS
        ========================= */}

        <section className="provider-incoming-section">
          <div className="provider-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                CUSTOMER ACTIVITY
              </span>

              <h2>Incoming Requests</h2>

              <p>
                View and manage service requests submitted by
                customers for your services.
              </p>
            </div>
          </div>

          {successMessage && (
            <div
              className="provider-request-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {!loading && error && (
            <div className="dashboard-error" role="alert">
              <h2>Unable to process request</h2>

              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading incoming requests...</p>
            </div>
          )}

          {!loading &&
            !error &&
            requests.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  S
                </div>

                <h2>No incoming requests yet</h2>

                <p>
                  You don't have any incoming service
                  requests at the moment. Customer requests
                  for your services will appear here.
                </p>

                <Link
                  to="/services"
                  className="dashboard-primary-button"
                >
                  View Available Services
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            requests.length > 0 && (
              <div className="provider-requests-grid">
                {requests.map((request) => (
                  <article
                    className="provider-request-card"
                    key={request._id}
                  >
                    <div className="provider-request-top">
                      <div>
                        <span className="provider-request-category">
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
                        {request.status}
                      </span>
                    </div>

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
                        <span>Request Date</span>

                        <strong>
                          {formatDate(request.createdAt)}
                        </strong>
                      </div>
                    </div>

                    <div className="provider-customer-info">
                      <span className="provider-section-label">
                        Customer Information
                      </span>

                      <div className="provider-customer-details">
                        <div>
                          <span>Name</span>

                          <strong>
                            {request.customerId?.name ||
                              "Customer unavailable"}
                          </strong>
                        </div>

                        <div>
                          <span>Email</span>

                          <strong>
                            {request.customerId?.email ||
                              "Email unavailable"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <div className="provider-request-message">
                        <span className="provider-section-label">
                          Customer Message
                        </span>

                        <p>{request.message}</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="provider-request-actions">
                        <button
                          type="button"
                          className="provider-accept-button"
                          onClick={() =>
                            updateRequestStatus(
                              request._id,
                              "accepted"
                            )
                          }
                          disabled={
                            updatingRequestId ===
                            request._id
                          }
                        >
                          {updatingRequestId ===
                          request._id
                            ? "Updating..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          className="provider-reject-button"
                          onClick={() =>
                            updateRequestStatus(
                              request._id,
                              "rejected"
                            )
                          }
                          disabled={
                            updatingRequestId ===
                            request._id
                          }
                        >
                          {updatingRequestId ===
                          request._id
                            ? "Updating..."
                            : "Reject"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
        </section>
      </section>
    </main>
  );
}

export default ProviderDashboard;


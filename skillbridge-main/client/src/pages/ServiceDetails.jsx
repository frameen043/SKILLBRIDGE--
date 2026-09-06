
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/services/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setError("SERVICE_NOT_FOUND");
          } else {
            setError(
              data.message || "Unable to load this service. Please try again."
            );
          }

          return;
        }

        setService(data.service);
      } catch (error) {
        console.error("Service details error:", error);

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  // Fetch reviews for this service
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) {
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await fetch(
          `http://localhost:5000/api/reviews/service/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load service reviews."
          );
        }

        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setTotalReviews(
          typeof data.totalReviews === "number"
            ? data.totalReviews
            : 0
        );
        setAverageRating(
          typeof data.averageRating === "number"
            ? data.averageRating
            : 0
        );
      } catch (error) {
        console.error("Service reviews error:", error);

        setReviewsError(
          error.message ||
            "Unable to load reviews. Please try again."
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleRequestClick = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (!user || user.role !== "customer") {
      setRequestError("Only customers can request services.");
      return;
    }

    setRequestError("");
    setRequestSuccess("");
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (!user || user.role !== "customer") {
      setRequestError("Only customers can request services.");
      return;
    }

    if (!message.trim()) {
      setRequestError("Please enter a message for the provider.");
      return;
    }

    try {
      setSubmitting(true);
      setRequestError("");
      setRequestSuccess("");

      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: id,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRequestError(
          data.message ||
            "Unable to submit the service request. Please try again."
        );
        return;
      }

      setRequestSuccess("Service request submitted successfully.");
      setMessage("");
      setShowRequestForm(false);
    } catch (error) {
      console.error("Service request error:", error);

      setRequestError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatReviewDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return (
      <span
        style={{
          color: "#f59e0b",
          fontSize: "20px",
          letterSpacing: "2px",
        }}
        aria-label={`${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #4f46e5",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "serviceDetailsSpin 0.8s linear infinite",
            }}
          />

          <h2
            style={{
              color: "#172033",
              marginBottom: "8px",
              fontSize: "22px",
            }}
          >
            Loading service...
          </h2>

          <p style={{ color: "#64748b" }}>
            Please wait while we load the service details.
          </p>
        </div>

        <style>
          {`
            @keyframes serviceDetailsSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </main>
    );
  }

  if (error === "SERVICE_NOT_FOUND") {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "620px",
            textAlign: "center",
            background: "#ffffff",
            padding: "48px 32px",
            borderRadius: "18px",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1
            style={{
              color: "#172033",
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            Service not found
          </h1>

          <p
            style={{
              color: "#64748b",
              lineHeight: "1.7",
              marginBottom: "28px",
            }}
          >
            The service you are looking for may have been removed or does not
            exist.
          </p>

          <Link
            to="/services"
            style={{
              display: "inline-block",
              background: "#4f46e5",
              color: "#ffffff",
              padding: "12px 22px",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "620px",
            textAlign: "center",
            background: "#ffffff",
            padding: "48px 32px",
            borderRadius: "18px",
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1
            style={{
              color: "#172033",
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            Unable to load service
          </h1>

          <p
            style={{
              color: "#64748b",
              lineHeight: "1.7",
              marginBottom: "28px",
            }}
          >
            {error}
          </p>

          <Link
            to="/services"
            style={{
              display: "inline-block",
              background: "#4f46e5",
              color: "#ffffff",
              padding: "12px 22px",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            Back to Services
          </Link>
        </div>
      </main>
    );
  }

  if (!service) {
    return null;
  }

  const provider = service.providerId;

  return (
    <main
      style={{
        minHeight: "70vh",
        padding: "70px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <Link
          to="/services"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#4f46e5",
            fontWeight: "600",
            marginBottom: "28px",
          }}
        >
          ← Back to Services
        </Link>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.25fr) minmax(300px, 0.75fr)",
          }}
        >
          <div
            style={{
              padding: "48px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: "#eef2ff",
                color: "#4f46e5",
                padding: "7px 12px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              {service.category}
            </span>

            <h1
              style={{
                color: "#172033",
                fontSize: "clamp(30px, 5vw, 46px)",
                lineHeight: "1.15",
                marginBottom: "20px",
              }}
            >
              {service.title}
            </h1>

            <p
              style={{
                color: "#64748b",
                fontSize: "17px",
                lineHeight: "1.8",
                whiteSpace: "pre-line",
              }}
            >
              {service.description}
            </p>

            {provider && (
              <div
                style={{
                  marginTop: "38px",
                  paddingTop: "28px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <h2
                  style={{
                    color: "#172033",
                    fontSize: "18px",
                    marginBottom: "14px",
                  }}
                >
                  Service Provider
                </h2>

                <p
                  style={{
                    color: "#172033",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  {provider.name}
                </p>

                <p style={{ color: "#64748b" }}>{provider.email}</p>
              </div>
            )}
          </div>

          <aside
            style={{
              background: "#f8fafc",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {service.imageUrl ? (
              <img
                src={service.imageUrl}
                alt={service.title}
                style={{
                  width: "100%",
                  height: "230px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  marginBottom: "28px",
                }}
              />
            ) : (
              <div
                style={{
                  height: "230px",
                  borderRadius: "14px",
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontSize: "42px",
                  fontWeight: "800",
                  marginBottom: "28px",
                }}
              >
                S
              </div>
            )}

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Service price
            </p>

            <p
              style={{
                color: "#172033",
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "24px",
              }}
            >
              ${service.price}
            </p>

            {requestSuccess && (
              <div
                role="status"
                style={{
                  background: "#ecfdf5",
                  color: "#047857",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {requestSuccess}
              </div>
            )}

            {requestError && (
              <div
                role="alert"
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {requestError}
              </div>
            )}

            {!showRequestForm ? (
              <button
                type="button"
                onClick={handleRequestClick}
                style={{
                  width: "100%",
                  border: "none",
                  background: "#4f46e5",
                  color: "#ffffff",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.opacity = "0.9";
                  event.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.opacity = "1";
                  event.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Request This Service
              </button>
            ) : (
              <form onSubmit={handleSubmitRequest}>
                <label
                  htmlFor="request-message"
                  style={{
                    display: "block",
                    color: "#172033",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Message to provider
                </label>

                <textarea
                  id="request-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell the provider what you need..."
                  rows="5"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "12px",
                    outline: "none",
                    color: "#172033",
                    background: "#ffffff",
                    marginBottom: "12px",
                  }}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    border: "none",
                    background: submitting ? "#94a3b8" : "#4f46e5",
                    color: "#ffffff",
                    padding: "14px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowRequestForm(false);
                    setRequestError("");
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    padding: "10px",
                    marginTop: "6px",
                    fontWeight: "600",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "12px",
              }}
            >
              You can submit a request to this service provider.
            </p>
          </aside>
        </section>

        {/* Reviews Section */}
        <section
          style={{
            marginTop: "36px",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "40px 48px",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "30px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  color: "#4f46e5",
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                }}
              >
                CUSTOMER REVIEWS
              </span>

              <h2
                style={{
                  color: "#172033",
                  fontSize: "28px",
                  margin: "0 0 8px",
                }}
              >
                Reviews for this service
              </h2>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                See what previous customers experienced with this service.
              </p>
            </div>

            {!reviewsLoading && !reviewsError && (
              <div
                style={{
                  minWidth: "170px",
                  background: "#f8fafc",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#172033",
                    fontSize: "30px",
                    fontWeight: "800",
                    lineHeight: "1",
                    marginBottom: "7px",
                  }}
                >
                  {averageRating > 0
                    ? averageRating.toFixed(1)
                    : "0.0"}
                </div>

                <div style={{ marginBottom: "5px" }}>
                  {renderStars(Math.round(averageRating))}
                </div>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {totalReviews}{" "}
                  {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>

          {reviewsLoading && (
            <div
              style={{
                padding: "35px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #e2e8f0",
                  borderTop: "3px solid #4f46e5",
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  animation: "serviceReviewsSpin 0.8s linear infinite",
                }}
              />

              <p>Loading reviews...</p>
            </div>
          )}

          {!reviewsLoading && reviewsError && (
            <div
              role="alert"
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "16px",
                borderRadius: "12px",
                lineHeight: "1.6",
              }}
            >
              {reviewsError}
            </div>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length === 0 && (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "14px",
                  padding: "32px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "10px",
                  }}
                >
                  ★
                </div>

                <h3
                  style={{
                    color: "#172033",
                    marginBottom: "8px",
                  }}
                >
                  No reviews yet
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  Be the first customer to review this service after your
                  completed request.
                </p>
              </div>
            )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "22px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            color: "#172033",
                            fontSize: "16px",
                            margin: "0 0 6px",
                          }}
                        >
                          {review.customerId?.name ||
                            "Anonymous Customer"}
                        </h3>

                        {renderStars(review.rating)}
                      </div>

                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                        }}
                      >
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        color: "#475569",
                        lineHeight: "1.7",
                        margin: 0,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {review.comment?.trim()
                        ? review.comment
                        : "No written comment was provided."}
                    </p>
                  </article>
                ))}
              </div>
            )}
        </section>
      </div>

      <style>
        {`
          @keyframes serviceReviewsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 800px) {
            main section {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 520px) {
            main {
              padding: 45px 16px !important;
            }

            main section > div,
            main section > aside {
              padding: 30px 24px !important;
            }
          }
        `}
      </style>
    </main>
  );
}

export default ServiceDetails;

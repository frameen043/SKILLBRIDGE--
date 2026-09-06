
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function ProfessionalProfile() {
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfessionalProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/users/professionals/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load professional profile."
          );
        }

        setProvider(data.provider || null);
        setServices(data.services || []);
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setAverageRating(data.averageRating || 0);
      } catch (error) {
        console.error("Fetch professional profile error:", error);

        setError(
          error.message ||
            "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfessionalProfile();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <span
        className="review-stars-display"
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

  if (loading) {
    return (
      <main className="services-page">
        <section className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">
              SKILLBRIDGE PROFESSIONAL
            </span>

            <h1>Professional Profile</h1>

            <p>
              Explore this professional's profile, services, and customer
              reviews.
            </p>
          </div>

          <div className="services-loading">
            <div className="services-spinner"></div>

            <p>Loading professional profile...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !provider) {
    return (
      <main className="services-page">
        <section className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">
              SKILLBRIDGE PROFESSIONAL
            </span>

            <h1>Professional Profile</h1>

            <p>
              Explore this professional's profile, services, and customer
              reviews.
            </p>
          </div>

          <div
            className="services-state services-error"
            role="alert"
          >
            <h2>Unable to load professional</h2>

            <p>
              {error || "This professional could not be found."}
            </p>

            <Link
              to="/professionals"
              className="services-retry-button"
            >
              Back to Professionals
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="services-page">
      <section className="services-container">
        {/* Profile Header */}
        <div className="services-header">
          <span className="services-eyebrow">
            SKILLBRIDGE PROFESSIONAL
          </span>

          <h1>{provider.name}</h1>

          <p>
            Explore this professional's services and customer reviews.
          </p>
        </div>

        {/* Professional Information */}
        <section
          className="professional-profile-card"
          style={{
            marginBottom: "40px",
            padding: "32px",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                fontSize: "34px",
                fontWeight: "700",
              }}
            >
              {provider.name
                ? provider.name.charAt(0).toUpperCase()
                : "P"}
            </div>

            <div style={{ flex: "1 1 250px" }}>
              <span className="service-category">
                Professional
              </span>

              <h2
                style={{
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {provider.name}
              </h2>

              {provider.email && (
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                  }}
                >
                  {provider.email}
                </p>
              )}
            </div>

            <div
              style={{
                minWidth: "180px",
                textAlign: "center",
                padding: "16px 20px",
                borderRadius: "12px",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {Number(averageRating).toFixed(1)}
              </div>

              <div style={{ margin: "4px 0" }}>
                {renderStars(averageRating)}
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section style={{ marginBottom: "48px" }}>
          <div className="services-header">
            <span className="services-eyebrow">
              SERVICES
            </span>

            <h2>Services offered</h2>

            <p>
              Explore the services available from {provider.name}.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="services-state">
              <h2>No services available</h2>

              <p>
                This professional has not added any services yet.
              </p>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <article
                  className="service-card"
                  key={service._id}
                >
                  <div className="service-card-image">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="service-image-placeholder">
                        <span>
                          {service.title
                            ? service.title
                                .charAt(0)
                                .toUpperCase()
                            : "S"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="service-card-content">
                    <span className="service-category">
                      {service.category}
                    </span>

                    <h2>{service.title}</h2>

                    <p className="service-description">
                      {service.description}
                    </p>

                    <div
                      style={{
                        marginTop: "12px",
                        marginBottom: "16px",
                        fontWeight: "600",
                      }}
                    >
                      ${Number(service.price || 0).toFixed(2)}
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="service-view-button"
                    >
                      View Service
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="reviews-section">
          <div className="services-header">
            <span className="services-eyebrow">
              CUSTOMER FEEDBACK
            </span>

            <h2>Reviews</h2>

            <p>
              See what customers have said about {provider.name}'s
              services.
            </p>
          </div>

          {totalReviews > 0 && (
            <div
              className="reviews-summary"
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
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: "30px",
                    }}
                  >
                    {Number(averageRating).toFixed(1)}
                  </strong>

                  <div>
                    {renderStars(averageRating)}
                  </div>
                </div>

                <div>
                  <strong>
                    {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </strong>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#64748b",
                    }}
                  >
                    Based on customer feedback
                  </p>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="services-state">
              <h2>No reviews yet</h2>

              <p>
                This professional has not received any customer reviews
                yet.
              </p>
            </div>
          ) : (
            <div
              className="reviews-list"
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              {reviews.map((review) => (
                <article
                  className="review-card"
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
                        {renderStars(review.rating)}
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

                  {review.comment ? (
                    <p
                      style={{
                        marginTop: "16px",
                        marginBottom: 0,
                        lineHeight: "1.7",
                        color: "#475569",
                      }}
                    >
                      {review.comment}
                    </p>
                  ) : (
                    <p
                      style={{
                        marginTop: "16px",
                        marginBottom: 0,
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

        {/* Back Link */}
        <div
          style={{
            marginTop: "40px",
          }}
        >
          <Link
            to="/professionals"
            className="dashboard-services-button"
          >
            ← Back to Professionals
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ProfessionalProfile;


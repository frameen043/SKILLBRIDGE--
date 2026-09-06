
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/services"
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Unable to load services. Please try again."
          );
          return;
        }

        setServices(data.services || []);
      } catch (error) {
        console.error("Fetch services error:", error);

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <main className="services-page">
        <section className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">SKILLBRIDGE MARKETPLACE</span>
            <h1>Find the right service for you.</h1>
            <p>
              Explore professional services offered by approved
              SkillBridge providers.
            </p>
          </div>

          <div className="services-loading">
            <div className="services-spinner"></div>
            <p>Loading services...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="services-page">
        <section className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">SKILLBRIDGE MARKETPLACE</span>
            <h1>Find the right service for you.</h1>
            <p>
              Explore professional services offered by approved
              SkillBridge providers.
            </p>
          </div>

          <div className="services-state services-error" role="alert">
            <h2>Unable to load services</h2>
            <p>{error}</p>
            <button
              type="button"
              className="services-retry-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="services-page">
      <section className="services-container">
        <div className="services-header">
          <span className="services-eyebrow">
            SKILLBRIDGE MARKETPLACE
          </span>

          <h1>Find the right service for you.</h1>

          <p>
            Explore professional services offered by approved
            SkillBridge providers.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="services-state">
            <h2>No services available yet</h2>
            <p>
              There are currently no services available in the
              marketplace. Please check again later.
            </p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service._id}>
                <div className="service-card-image">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                    />
                  ) : (
                    <div className="service-image-placeholder">
                      <span>SB</span>
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

                  <div className="service-card-footer">
                    <div className="service-provider">
                      <span className="service-provider-label">
                        Provider
                      </span>

                      <strong>
                        {service.providerId?.name || "SkillBridge Provider"}
                      </strong>
                    </div>

                    <div className="service-price">
                      <span>From</span>
                      <strong>${service.price}</strong>
                    </div>
                  </div>

                  <Link
                    to={`/services/${service._id}`}
                    className="service-view-button"
                  >
                    View service
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

export default Services;


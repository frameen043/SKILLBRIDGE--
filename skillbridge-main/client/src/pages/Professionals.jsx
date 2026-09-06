import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Professionals() {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError("");

        const query = search.trim()
          ? `?search=${encodeURIComponent(search.trim())}`
          : "";

        const response = await fetch(
          `http://localhost:5000/api/users/professionals${query}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load professionals. Please try again."
          );

          return;
        }

        setProviders(data.providers || []);
      } catch (error) {
        console.error("Fetch professionals error:", error);

        setError(
          "Unable to connect to the SkillBridge server. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  if (loading) {
    return (
      <main className="services-page">
        <section className="services-container">
          <div className="services-header">
            <span className="services-eyebrow">
              SKILLBRIDGE PROFESSIONALS
            </span>

            <h1>Find skilled professionals.</h1>

            <p>
              Explore approved professionals and discover the services they
              offer.
            </p>
          </div>

          <div className="services-loading">
            <div className="services-spinner"></div>

            <p>Loading professionals...</p>
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
            <span className="services-eyebrow">
              SKILLBRIDGE PROFESSIONALS
            </span>

            <h1>Find skilled professionals.</h1>

            <p>
              Explore approved professionals and discover the services they
              offer.
            </p>
          </div>

          <div
            className="services-state services-error"
            role="alert"
          >
            <h2>Unable to load professionals</h2>

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
            SKILLBRIDGE PROFESSIONALS
          </span>

          <h1>Find skilled professionals.</h1>

          <p>
            Browse approved SkillBridge professionals and explore their
            available services.
          </p>
        </div>

        <div
          style={{
            marginBottom: "32px",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search professionals by name or email..."
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>

        {providers.length === 0 ? (
          <div className="services-state">
            <h2>No professionals found</h2>

            <p>
              {search.trim()
                ? "No professionals matched your search."
                : "There are currently no approved professionals available."}
            </p>
          </div>
        ) : (
          <div className="services-grid">
            {providers.map((provider) => (
              <article
                className="service-card"
                key={provider._id}
              >
                <div className="service-card-image">
                  <div className="service-image-placeholder">
                    <span>
                      {provider.name
                        ? provider.name.charAt(0).toUpperCase()
                        : "P"}
                    </span>
                  </div>
                </div>

                <div className="service-card-content">
                  <span className="service-category">
                    Professional
                  </span>

                  <h2>{provider.name}</h2>

                  {provider.email && (
                    <p className="service-description">
                      {provider.email}
                    </p>
                  )}

                  <Link
                    to={`/professionals/${provider._id}`}
                    className="service-view-button"
                  >
                    View Profile
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

export default Professionals;
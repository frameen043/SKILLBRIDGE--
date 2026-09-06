
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingServiceId, setDeletingServiceId] =
    useState("");

  const fetchServices = async (searchValue = "") => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = searchValue.trim()
        ? `?search=${encodeURIComponent(searchValue.trim())}`
        : "";

      const response = await fetch(
        `${API_BASE_URL}/api/services${query}`,
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
              "You do not have permission to manage services."
          );
          return;
        }

        setError(
          data.message || "Unable to load services."
        );
        return;
      }

      setServices(data.services || []);
    } catch (error) {
      console.error("Services loading error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [navigate]);

  const handleSearch = (event) => {
    event.preventDefault();

    setSuccessMessage("");
    fetchServices(search);
  };

  const clearSearch = () => {
    setSearch("");
    setSuccessMessage("");
    fetchServices("");
  };

  const deleteService = async (serviceId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const service = services.find(
      (item) => item._id === serviceId
    );

    if (!service) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        service.title || "this service"
      }"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setDeletingServiceId(serviceId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/services/${serviceId}`,
        {
          method: "DELETE",
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
              "You do not have permission to delete this service."
          );
          return;
        }

        setError(
          data.message ||
            "Unable to delete this service."
        );
        return;
      }

      setServices((currentServices) =>
        currentServices.filter(
          (serviceItem) =>
            serviceItem._id !== serviceId
        )
      );

      setSuccessMessage(
        data.message ||
          "Service deleted successfully."
      );
    } catch (error) {
      console.error("Delete service error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setDeletingServiceId("");
    }
  };

  const getDisplayPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "Not specified";
    }

    return `Rs. ${Number(price).toLocaleString()}`;
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

  const getProviderName = (service) => {
    if (
      service.providerId &&
      typeof service.providerId === "object"
    ) {
      return (
        service.providerId.name ||
        "Provider unavailable"
      );
    }

    return "Provider unavailable";
  };

  const getProviderEmail = (service) => {
    if (
      service.providerId &&
      typeof service.providerId === "object"
    ) {
      return service.providerId.email || "";
    }

    return "";
  };

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              SERVICE MANAGEMENT
            </span>

            <h1>Services</h1>

            <p>
              Review marketplace services and remove
              inappropriate listings when necessary.
            </p>
          </div>
        </div>

        {successMessage && (
          <div
            className="admin-success-message"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div className="dashboard-error" role="alert">
            <h2>Unable to process request</h2>

            <p>{error}</p>

            <button
              type="button"
              className="admin-retry-button"
              onClick={() => fetchServices(search)}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-users-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                MARKETPLACE LISTINGS
              </span>

              <h2>All Services</h2>
            </div>

            <span className="admin-record-count">
              {loading
                ? "Loading..."
                : `${services.length} ${
                    services.length === 1
                      ? "service"
                      : "services"
                  }`}
            </span>
          </div>

          <form
            className="admin-search-form"
            onSubmit={handleSearch}
          >
            <div className="admin-search-input-wrapper">
              <span
                className="admin-search-icon"
                aria-hidden="true"
              >
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services by title or description..."
                aria-label="Search services"
              />
            </div>

            <button
              type="submit"
              className="admin-search-button"
              disabled={loading}
            >
              Search
            </button>

            {search.trim() && (
              <button
                type="button"
                className="admin-clear-search-button"
                onClick={clearSearch}
                disabled={loading}
              >
                Clear
              </button>
            )}
          </form>

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading services...</p>
            </div>
          )}

          {!loading &&
            !error &&
            services.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  S
                </div>

                <h2>
                  {search.trim()
                    ? "No services found"
                    : "No services yet"}
                </h2>

                <p>
                  {search.trim()
                    ? "No service listings match your search."
                    : "There are currently no service listings to display."}
                </p>

                {search.trim() && (
                  <button
                    type="button"
                    className="admin-clear-search-button"
                    onClick={clearSearch}
                  >
                    View All Services
                  </button>
                )}
              </div>
            )}

          {!loading &&
            !error &&
            services.length > 0 && (
              <div className="admin-table-wrapper">
                <table className="admin-users-table admin-services-table">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Category</th>
                      <th>Provider</th>
                      <th>Price</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {services.map((service) => {
                      const isDeleting =
                        deletingServiceId ===
                        service._id;

                      const providerName =
                        getProviderName(service);

                      const providerEmail =
                        getProviderEmail(service);

                      return (
                        <tr key={service._id}>
                          <td>
                            <div className="admin-service-cell">
                              <div className="admin-service-avatar">
                                {service.title
                                  ? service.title
                                      .charAt(0)
                                      .toUpperCase()
                                  : "S"}
                              </div>

                              <div>
                                <strong>
                                  {service.title ||
                                    "Untitled service"}
                                </strong>

                                <span>
                                  {service.description
                                    ? service.description.length >
                                      80
                                      ? `${service.description.slice(
                                          0,
                                          80
                                        )}...`
                                      : service.description
                                    : "No description available"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="admin-service-category">
                              {service.category ||
                                "Other"}
                            </span>
                          </td>

                          <td>
                            <div className="admin-service-provider">
                              <strong>
                                {providerName}
                              </strong>

                              {providerEmail && (
                                <span>
                                  {providerEmail}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="admin-service-price">
                              {getDisplayPrice(
                                service.price
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="admin-user-date">
                              {getDisplayDate(
                                service.createdAt
                              )}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() =>
                                deleteService(
                                  service._id
                                )
                              }
                              disabled={isDeleting}
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </section>
    </main>
  );
}

export default AdminServices;


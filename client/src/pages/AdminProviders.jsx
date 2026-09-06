
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminProviders() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingProviderId, setUpdatingProviderId] = useState("");

  const fetchProviders = async (searchValue = "") => {
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
        `${API_BASE_URL}/api/users/providers${query}`,
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
              "You do not have permission to manage providers."
          );
          return;
        }

        setError(
          data.message || "Unable to load providers."
        );
        return;
      }

      setProviders(data.providers || []);
    } catch (error) {
      console.error("Providers loading error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [navigate]);

  const handleSearch = (event) => {
    event.preventDefault();

    setSuccessMessage("");
    fetchProviders(search);
  };

  const clearSearch = () => {
    setSearch("");
    setSuccessMessage("");
    fetchProviders("");
  };

  const updateProviderStatus = async (
    providerId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const provider = providers.find(
      (item) => item._id === providerId
    );

    if (!provider) {
      return;
    }

    let action = "update";

    if (newStatus === "approved") {
      action = "approve";
    } else if (newStatus === "rejected") {
      action = "reject";
    } else if (newStatus === "deactivated") {
      action = "deactivate";
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        provider.name || "this provider"
      }?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setUpdatingProviderId(providerId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/providers/${providerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
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

        if (response.status === 403) {
          setError(
            data.message ||
              "You do not have permission to update this provider."
          );
          return;
        }

        setError(
          data.message ||
            `Unable to ${action} this provider.`
        );
        return;
      }

      const updatedProvider =
        data.provider || data.user;

      setProviders((currentProviders) =>
        currentProviders.map((item) =>
          item._id === providerId
            ? {
                ...item,
                ...(updatedProvider || {}),
                status:
                  updatedProvider?.status || newStatus,
              }
            : item
        )
      );

      setSuccessMessage(
        data.message ||
          `Provider ${action}d successfully.`
      );
    } catch (error) {
      console.error(
        "Provider status update error:",
        error
      );

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setUpdatingProviderId("");
    }
  };

  const getStatusClass = (status) => {
    if (status === "pending") {
      return "admin-provider-status admin-provider-status-pending";
    }

    if (status === "rejected") {
      return "admin-provider-status admin-provider-status-rejected";
    }

    if (status === "deactivated") {
      return "admin-provider-status admin-provider-status-deactivated";
    }

    return "admin-provider-status admin-provider-status-approved";
  };

  const getStatusLabel = (status) => {
    if (status === "pending") {
      return "Pending";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    if (status === "deactivated") {
      return "Deactivated";
    }

    return "Approved";
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

  const renderActions = (provider) => {
    const isUpdating =
      updatingProviderId === provider._id;

    if (provider.status === "pending") {
      return (
        <>
          <button
            type="button"
            className="admin-approve-button"
            onClick={() =>
              updateProviderStatus(
                provider._id,
                "approved"
              )
            }
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Approve"}
          </button>

          <button
            type="button"
            className="admin-reject-button"
            onClick={() =>
              updateProviderStatus(
                provider._id,
                "rejected"
              )
            }
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Reject"}
          </button>
        </>
      );
    }

    if (provider.status === "approved") {
      return (
        <button
          type="button"
          className="admin-deactivate-button"
          onClick={() =>
            updateProviderStatus(
              provider._id,
              "deactivated"
            )
          }
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Deactivate"}
        </button>
      );
    }

    return (
      <span className="admin-no-action-label">
        No action available
      </span>
    );
  };

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              PROVIDER MANAGEMENT
            </span>

            <h1>Providers</h1>

            <p>
              Review provider accounts and manage their
              marketplace status.
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
              onClick={() => fetchProviders(search)}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-users-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                PROVIDER ACCOUNTS
              </span>

              <h2>All Providers</h2>
            </div>

            <span className="admin-record-count">
              {loading
                ? "Loading..."
                : `${providers.length} ${
                    providers.length === 1
                      ? "provider"
                      : "providers"
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
                placeholder="Search providers by name or email..."
                aria-label="Search providers"
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

              <p>Loading providers...</p>
            </div>
          )}

          {!loading &&
            !error &&
            providers.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  P
                </div>

                <h2>
                  {search.trim()
                    ? "No providers found"
                    : "No providers yet"}
                </h2>

                <p>
                  {search.trim()
                    ? "No provider accounts match your search."
                    : "There are currently no provider accounts to display."}
                </p>

                {search.trim() && (
                  <button
                    type="button"
                    className="admin-clear-search-button"
                    onClick={clearSearch}
                  >
                    View All Providers
                  </button>
                )}
              </div>
            )}

          {!loading &&
            !error &&
            providers.length > 0 && (
              <div className="admin-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {provider.name
                                ? provider.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "P"}
                            </div>

                            <div>
                              <strong>
                                {provider.name ||
                                  "Name unavailable"}
                              </strong>

                              <span>
                                Provider
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-user-email">
                            {provider.email ||
                              "Email unavailable"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              provider.status
                            )}
                          >
                            {getStatusLabel(
                              provider.status
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-date">
                            {getDisplayDate(
                              provider.createdAt
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="admin-user-actions">
                            {renderActions(provider)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </section>
    </main>
  );
}

export default AdminProviders;


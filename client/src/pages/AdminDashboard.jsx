
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [approvingProviderId, setApprovingProviderId] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    providers: 0,
    services: 0,
    requests: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const fetchPendingProviders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/providers/pending",
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
          data.message || "Unable to load pending providers."
        );
        return;
      }

      setProviders(data.providers || []);
    } catch (error) {
      console.error("Pending providers error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/admin/stats",
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

        setStatsError(
          data.message || "Unable to load dashboard statistics."
        );
        return;
      }

      const dashboardStats = data.stats || data;

      setStats({
        totalUsers: dashboardStats.totalUsers || 0,
        customers: dashboardStats.customers || 0,
        providers: dashboardStats.providers || 0,
        services: dashboardStats.services || 0,
        requests: dashboardStats.requests || 0,
      });
    } catch (error) {
      console.error("Dashboard statistics error:", error);

      setStatsError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
    fetchDashboardStats();
  }, [navigate]);

  const approveProvider = async (providerId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setSuccessMessage("");
    setApprovingProviderId(providerId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/providers/${providerId}/approve`,
        {
          method: "PATCH",
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
          data.message || "Unable to approve this provider."
        );
        return;
      }

      // Remove the provider only after successful backend approval.
      setProviders((currentProviders) =>
        currentProviders.filter(
          (provider) => provider._id !== providerId
        )
      );

      setStats((currentStats) => ({
        ...currentStats,
        providers: currentStats.providers + 1,
      }));

      setSuccessMessage(
        data.message || "Provider approved successfully."
      );
    } catch (error) {
      console.error("Approve provider error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setApprovingProviderId("");
    }
  };

  const retryStats = () => {
    fetchDashboardStats();
  };

  const retryProviders = () => {
    fetchPendingProviders();
  };

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              ADMIN DASHBOARD
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Monitor SkillBridge activity and manage provider
              approvals from one place.
            </p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <section className="admin-stats-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                PLATFORM OVERVIEW
              </span>

              <h2>Marketplace Statistics</h2>
            </div>
          </div>

          {statsLoading && (
            <div className="dashboard-state admin-stats-state">
              <div className="dashboard-loader"></div>
              <p>Loading dashboard statistics...</p>
            </div>
          )}

          {!statsLoading && statsError && (
            <div className="dashboard-error" role="alert">
              <h2>Unable to load statistics</h2>

              <p>{statsError}</p>

              <button
                type="button"
                className="admin-retry-button"
                onClick={retryStats}
              >
                Retry
              </button>
            </div>
          )}

          {!statsLoading && !statsError && (
            <div className="admin-stats-grid">
              <article className="admin-stat-card">
                <div className="admin-stat-icon">U</div>

                <div className="admin-stat-content">
                  <span>Total Users</span>
                  <strong>{stats.totalUsers}</strong>
                </div>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-icon">C</div>

                <div className="admin-stat-content">
                  <span>Customers</span>
                  <strong>{stats.customers}</strong>
                </div>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-icon">P</div>

                <div className="admin-stat-content">
                  <span>Providers</span>
                  <strong>{stats.providers}</strong>
                </div>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-icon">S</div>

                <div className="admin-stat-content">
                  <span>Services</span>
                  <strong>{stats.services}</strong>
                </div>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-icon">R</div>

                <div className="admin-stat-content">
                  <span>Requests</span>
                  <strong>{stats.requests}</strong>
                </div>
              </article>
            </div>
          )}
        </section>

        {/* Provider Approval */}
        <section className="admin-provider-approval-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                PROVIDER MANAGEMENT
              </span>

              <h2>Provider Approval</h2>

              <p>
                Review and approve providers waiting to join
                the SkillBridge marketplace.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="admin-success-message" role="status">
              {successMessage}
            </div>
          )}

          {!loading && error && (
            <div className="dashboard-error" role="alert">
              <h2>Unable to process request</h2>

              <p>{error}</p>

              <button
                type="button"
                className="admin-retry-button"
                onClick={retryProviders}
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading pending providers...</p>
            </div>
          )}

          {!loading && !error && providers.length === 0 && (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">S</div>

              <h2>No pending providers</h2>

              <p>
                There are currently no provider accounts waiting
                for approval.
              </p>
            </div>
          )}

          {!loading && !error && providers.length > 0 && (
            <div className="admin-providers-grid">
              {providers.map((provider) => (
                <article
                  className="admin-provider-card"
                  key={provider._id}
                >
                  <div className="admin-provider-top">
                    <div className="admin-provider-avatar">
                      {provider.name
                        ? provider.name
                            .charAt(0)
                            .toUpperCase()
                        : "P"}
                    </div>

                    <span className="admin-provider-status">
                      {provider.status || "pending"}
                    </span>
                  </div>

                  <div className="admin-provider-details">
                    <div>
                      <span>Name</span>

                      <h2>
                        {provider.name || "Name unavailable"}
                      </h2>
                    </div>

                    <div>
                      <span>Email</span>

                      <p>
                        {provider.email ||
                          "Email unavailable"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="admin-approve-button"
                    onClick={() =>
                      approveProvider(provider._id)
                    }
                    disabled={
                      approvingProviderId === provider._id
                    }
                  >
                    {approvingProviderId === provider._id
                      ? "Approving..."
                      : "Approve Provider"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;


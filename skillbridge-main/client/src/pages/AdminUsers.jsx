
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminUsers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingCustomerId, setUpdatingCustomerId] = useState("");

  const fetchCustomers = async (searchValue = "") => {
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
        `${API_BASE_URL}/api/users/customers${query}`,
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
              "You do not have permission to manage customers."
          );
          return;
        }

        setError(
          data.message || "Unable to load customers."
        );
        return;
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Customers loading error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [navigate]);

  const handleSearch = (event) => {
    event.preventDefault();

    setSuccessMessage("");
    fetchCustomers(search);
  };

  const clearSearch = () => {
    setSearch("");
    setSuccessMessage("");
    fetchCustomers("");
  };

  const updateCustomerStatus = async (
    customerId,
    newStatus
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const customer = customers.find(
      (item) => item._id === customerId
    );

    if (!customer) {
      return;
    }

    const action =
      newStatus === "deactivated"
        ? "deactivate"
        : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${customer.name || "this customer"}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setUpdatingCustomerId(customerId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/customers/${customerId}/status`,
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
              "You do not have permission to update this customer."
          );
          return;
        }

        setError(
          data.message ||
            `Unable to ${action} this customer.`
        );
        return;
      }

      const updatedCustomer =
        data.customer || data.user;

      setCustomers((currentCustomers) =>
        currentCustomers.map((item) =>
          item._id === customerId
            ? {
                ...item,
                ...(updatedCustomer || {}),
                status:
                  updatedCustomer?.status || newStatus,
              }
            : item
        )
      );

      setSuccessMessage(
        data.message ||
          `Customer ${action}d successfully.`
      );
    } catch (error) {
      console.error(
        "Customer status update error:",
        error
      );

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setUpdatingCustomerId("");
    }
  };

  const getStatusClass = (status) => {
    if (status === "deactivated") {
      return "admin-user-status admin-user-status-deactivated";
    }

    return "admin-user-status admin-user-status-approved";
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

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              USER MANAGEMENT
            </span>

            <h1>Customers</h1>

            <p>
              View and manage customer accounts on the
              SkillBridge marketplace.
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
              onClick={() => fetchCustomers(search)}
            >
              Retry
            </button>
          </div>
        )}

        <section className="admin-users-section">
          <div className="admin-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                CUSTOMER ACCOUNTS
              </span>

              <h2>All Customers</h2>
            </div>

            <span className="admin-record-count">
              {loading
                ? "Loading..."
                : `${customers.length} ${
                    customers.length === 1
                      ? "customer"
                      : "customers"
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
                placeholder="Search customers by name or email..."
                aria-label="Search customers"
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

              <p>Loading customers...</p>
            </div>
          )}

          {!loading &&
            !error &&
            customers.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  U
                </div>

                <h2>
                  {search.trim()
                    ? "No customers found"
                    : "No customers yet"}
                </h2>

                <p>
                  {search.trim()
                    ? "No customer accounts match your search."
                    : "There are currently no customer accounts to display."}
                </p>

                {search.trim() && (
                  <button
                    type="button"
                    className="admin-clear-search-button"
                    onClick={clearSearch}
                  >
                    View All Customers
                  </button>
                )}
              </div>
            )}

          {!loading &&
            !error &&
            customers.length > 0 && (
              <div className="admin-table-wrapper">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => {
                      const isUpdating =
                        updatingCustomerId ===
                        customer._id;

                      const isDeactivated =
                        customer.status ===
                        "deactivated";

                      return (
                        <tr key={customer._id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">
                                {customer.name
                                  ? customer.name
                                      .charAt(0)
                                      .toUpperCase()
                                  : "C"}
                              </div>

                              <div>
                                <strong>
                                  {customer.name ||
                                    "Name unavailable"}
                                </strong>

                                <span>
                                  Customer
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="admin-user-email">
                              {customer.email ||
                                "Email unavailable"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                customer.status
                              )}
                            >
                              {customer.status ===
                              "deactivated"
                                ? "Deactivated"
                                : "Approved"}
                            </span>
                          </td>

                          <td>
                            <span className="admin-user-date">
                              {getDisplayDate(
                                customer.createdAt
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="admin-user-actions">
                              {isDeactivated ? (
                                <button
                                  type="button"
                                  className="admin-reactivate-button"
                                  onClick={() =>
                                    updateCustomerStatus(
                                      customer._id,
                                      "approved"
                                    )
                                  }
                                  disabled={isUpdating}
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Reactivate"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-deactivate-button"
                                  onClick={() =>
                                    updateCustomerStatus(
                                      customer._id,
                                      "deactivated"
                                    )
                                  }
                                  disabled={isUpdating}
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Deactivate"}
                                </button>
                              )}
                            </div>
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

export default AdminUsers;


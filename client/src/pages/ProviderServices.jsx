import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const initialServiceForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  imageUrl: "",
};

function ProviderServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [serviceForm, setServiceForm] =
    useState(initialServiceForm);

  const [creatingService, setCreatingService] =
    useState(false);

  const [serviceError, setServiceError] =
    useState("");

  const [serviceSuccess, setServiceSuccess] =
    useState("");

  const [editingService, setEditingService] =
    useState(null);

  const [editForm, setEditForm] =
    useState(initialServiceForm);

  const [updatingService, setUpdatingService] =
    useState(false);

  const [deletingServiceId, setDeletingServiceId] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState("");

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const fetchMyServices = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setLoading(true);
      setError("");

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
          handleUnauthorized();
          return;
        }

        setError(
          data.message ||
            "Unable to load your services."
        );

        return;
      }

      setServices(data.services || []);
    } catch (error) {
      console.error("Provider services error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleServiceChange = (event) => {
    const { name, value } = event.target;

    setServiceForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const createService = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setServiceError("");
    setServiceSuccess("");
    setActionError("");
    setActionSuccess("");

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
            description:
              serviceForm.description.trim(),
            category: serviceForm.category,
            price: Number(serviceForm.price),
            imageUrl: serviceForm.imageUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setServiceError(
          data.message ||
            "Unable to create your service."
        );

        return;
      }

      setServiceSuccess(
        data.message ||
          "Service created successfully."
      );

      setServiceForm(initialServiceForm);

      // Refresh provider's own service list.
      await fetchMyServices();
    } catch (error) {
      console.error("Create service error:", error);

      setServiceError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setCreatingService(false);
    }
  };

  const openEditService = (service) => {
    setActionError("");
    setActionSuccess("");

    setEditingService(service);

    setEditForm({
      title: service.title || "",
      description: service.description || "",
      category: service.category || "",
      price:
        service.price !== undefined
          ? String(service.price)
          : "",
      imageUrl: service.imageUrl || "",
    });
  };

  const closeEditService = () => {
    if (updatingService) {
      return;
    }

    setEditingService(null);
    setEditForm(initialServiceForm);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const updateService = async (event) => {
    event.preventDefault();

    if (!editingService?._id) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionError("");
    setActionSuccess("");

    if (
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !editForm.category ||
      editForm.price === ""
    ) {
      setActionError(
        "Please fill in all required service information."
      );

      return;
    }

    try {
      setUpdatingService(true);

      const response = await fetch(
        `http://localhost:5000/api/services/${editingService._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            description:
              editForm.description.trim(),
            category: editForm.category,
            price: Number(editForm.price),
            imageUrl: editForm.imageUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        setActionError(
          data.message ||
            "Unable to update your service."
        );

        return;
      }

      setServices((currentServices) =>
        currentServices.map((service) =>
          service._id === editingService._id
            ? data.service || {
                ...service,
                title: editForm.title.trim(),
                description:
                  editForm.description.trim(),
                category: editForm.category,
                price: Number(editForm.price),
                imageUrl: editForm.imageUrl.trim(),
              }
            : service
        )
      );

      setActionSuccess(
        data.message ||
          "Service updated successfully."
      );

      closeEditService();
    } catch (error) {
      console.error("Update service error:", error);

      setActionError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setUpdatingService(false);
    }
  };

  const deleteService = async (serviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionError("");
    setActionSuccess("");

    try {
      setDeletingServiceId(serviceId);

      const response = await fetch(
        `http://localhost:5000/api/services/${serviceId}`,
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
          handleUnauthorized();
          return;
        }

        setActionError(
          data.message ||
            "Unable to delete your service."
        );

        return;
      }

      setServices((currentServices) =>
        currentServices.filter(
          (service) => service._id !== serviceId
        )
      );

      setActionSuccess(
        data.message ||
          "Service deleted successfully."
      );
    } catch (error) {
      console.error("Delete service error:", error);

      setActionError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setDeletingServiceId("");
    }
  };

  return (
    <main className="provider-dashboard">
      <section className="provider-dashboard-container">

        {/* Page Header */}
        <div className="provider-dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              PROVIDER SERVICES
            </span>

            <h1>Manage Your Services</h1>

            <p>
              Create, edit, and manage the services you
              offer on SkillBridge.
            </p>
          </div>

          <Link
            to="/provider/dashboard"
            className="provider-services-button"
          >
            Back to Dashboard
          </Link>
        </div>


        {/* Create Service */}
        <section className="provider-create-service">
          <div className="provider-create-service-heading">
            <div>
              <span className="dashboard-eyebrow">
                CREATE SERVICE
              </span>

              <h2>Add a New Service</h2>

              <p>
                Add another service to your SkillBridge
                provider profile.
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


        {/* My Services */}
        <section className="provider-incoming-section">
          <div className="provider-section-heading">
            <div>
              <span className="dashboard-eyebrow">
                YOUR SERVICES
              </span>

              <h2>My Service Listings</h2>

              <p>
                Edit or remove the services you have
                created.
              </p>
            </div>
          </div>

          {actionSuccess && (
            <div
              className="provider-service-success"
              role="status"
            >
              {actionSuccess}
            </div>
          )}

          {actionError && (
            <div
              className="provider-service-error"
              role="alert"
            >
              {actionError}
            </div>
          )}

          {loading && (
            <div className="dashboard-state">
              <div className="dashboard-loader"></div>

              <p>Loading your services...</p>
            </div>
          )}

          {!loading && error && (
            <div
              className="dashboard-error"
              role="alert"
            >
              <h2>Unable to load services</h2>

              <p>{error}</p>

              <button
                type="button"
                className="dashboard-primary-button"
                onClick={fetchMyServices}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            services.length === 0 && (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  S
                </div>

                <h2>No services yet</h2>

                <p>
                  You have not created any services yet.
                  Use the form above to add your first
                  service.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            services.length > 0 && (
              <div className="customer-requests-grid">
                {services.map((service) => (
                  <article
                    className="customer-request-card"
                    key={service._id}
                  >
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
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
                            {service.category}
                          </span>

                          <h2>{service.title}</h2>
                        </div>

                        <strong>
                          {service.price}
                        </strong>
                      </div>

                      <div className="provider-request-message">
                        <span className="provider-section-label">
                          Description
                        </span>

                        <p>
                          {service.description}
                        </p>
                      </div>

                      <div className="provider-request-actions">
                        <button
                          type="button"
                          className="provider-accept-button"
                          onClick={() =>
                            openEditService(service)
                          }
                        >
                          Edit Service
                        </button>

                        <button
                          type="button"
                          className="provider-reject-button"
                          onClick={() =>
                            deleteService(service._id)
                          }
                          disabled={
                            deletingServiceId ===
                            service._id
                          }
                        >
                          {deletingServiceId ===
                          service._id
                            ? "Deleting..."
                            : "Delete Service"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>


        {/* Edit Service Modal */}
        {editingService && (
          <div
            className="provider-edit-modal-backdrop"
            role="presentation"
          >
            <div
              className="provider-edit-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-service-title"
            >
              <div className="provider-create-service-heading">
                <div>
                  <span className="dashboard-eyebrow">
                    EDIT SERVICE
                  </span>

                  <h2 id="edit-service-title">
                    Update Your Service
                  </h2>

                  <p>
                    Update the information for this service.
                  </p>
                </div>

                <button
                  type="button"
                  className="provider-modal-close"
                  onClick={closeEditService}
                  disabled={updatingService}
                  aria-label="Close edit service form"
                >
                  ×
                </button>
              </div>

              {actionError && (
                <div
                  className="provider-service-error"
                  role="alert"
                >
                  {actionError}
                </div>
              )}

              <form
                className="provider-service-form"
                onSubmit={updateService}
              >
                <div className="provider-service-field">
                  <label htmlFor="edit-title">
                    Service Title
                  </label>

                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={editForm.title}
                    onChange={handleEditChange}
                    disabled={updatingService}
                    required
                  />
                </div>

                <div className="provider-service-field">
                  <label htmlFor="edit-category">
                    Category
                  </label>

                  <select
                    id="edit-category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    disabled={updatingService}
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
                  <label htmlFor="edit-price">
                    Service Price
                  </label>

                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={handleEditChange}
                    disabled={updatingService}
                    required
                  />
                </div>

                <div className="provider-service-field">
                  <label htmlFor="edit-imageUrl">
                    Image URL
                  </label>

                  <input
                    id="edit-imageUrl"
                    name="imageUrl"
                    type="url"
                    value={editForm.imageUrl}
                    onChange={handleEditChange}
                    disabled={updatingService}
                  />
                </div>

                <div className="provider-service-field provider-service-description-field">
                  <label htmlFor="edit-description">
                    Service Description
                  </label>

                  <textarea
                    id="edit-description"
                    name="description"
                    rows="5"
                    value={editForm.description}
                    onChange={handleEditChange}
                    disabled={updatingService}
                    required
                  />
                </div>

                <div className="provider-request-actions">
                  <button
                    type="submit"
                    className="provider-accept-button"
                    disabled={updatingService}
                  >
                    {updatingService
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="provider-reject-button"
                    onClick={closeEditService}
                    disabled={updatingService}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProviderServices;
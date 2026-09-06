import { useEffect, useState } from "react";

function CustomerProfile() {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your profile."
          );
        }

        setProfile(data.user);

        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch (error) {
        console.error("Customer profile error:", error);

        setError(
          error.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/users/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update your profile."
        );
      }

      setProfile(data.user);

      setName(data.user.name || "");
      setEmail(data.user.email || "");

      setSuccess(
        data.message || "Profile updated successfully."
      );

      // Keep local authentication user information updated
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name: data.user.name,
            email: data.user.email,
          })
        );
      }
    } catch (error) {
      console.error("Update customer profile error:", error);

      setError(
        error.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-loading">
            <div className="services-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </section>
      </main>
    );
  }


  if (error && !profile) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <div
            className="services-state services-error"
            role="alert"
          >
            <h2>Unable to load profile</h2>

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
    <main className="profile-page">
      <section className="profile-container">

        <div className="profile-header">
          <span className="services-eyebrow">
            CUSTOMER ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            View and update your personal SkillBridge
            account information.
          </p>
        </div>


        <div className="profile-card">

          {error && (
            <div
              className="profile-message profile-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {success && (
            <div
              className="profile-message profile-success"
              role="status"
            >
              {success}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <div className="profile-field">
              <label htmlFor="customer-name">
                Full Name
              </label>

              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                disabled={saving}
              />
            </div>


            <div className="profile-field">
              <label htmlFor="customer-email">
                Email Address
              </label>

              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                disabled={saving}
              />
            </div>


            <div className="profile-field">
              <label>Account Role</label>

              <input
                type="text"
                value="Customer"
                disabled
              />
            </div>


            <button
              type="submit"
              className="service-view-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>

        </div>

      </section>
    </main>
  );
}

export default CustomerProfile;
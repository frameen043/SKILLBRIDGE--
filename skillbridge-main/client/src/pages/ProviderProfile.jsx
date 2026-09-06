import { useEffect, useState } from "react";

function ProviderProfile() {
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
          "http://localhost:5000/api/users/provider/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load your professional profile."
          );
        }

        setProfile(data.user);

        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch (error) {
        console.error("Provider profile error:", error);

        setError(
          error.message ||
            "Unable to load your professional profile."
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
        "http://localhost:5000/api/users/provider/profile",
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
          data.message ||
            "Unable to update your professional profile."
        );
      }

      setProfile(data.user);

      setName(data.user.name || "");
      setEmail(data.user.email || "");

      setSuccess(
        data.message ||
          "Professional profile updated successfully."
      );

      // Update locally stored authentication user
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
      console.error("Update provider profile error:", error);

      setError(
        error.message ||
          "Unable to update your professional profile."
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

            <p>
              Loading your professional profile...
            </p>
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
            PROVIDER ACCOUNT
          </span>

          <h1>My Professional Profile</h1>

          <p>
            Manage the information associated with your
            SkillBridge provider account.
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
              <label htmlFor="provider-name">
                Professional Name
              </label>

              <input
                id="provider-name"
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
              <label htmlFor="provider-email">
                Email Address
              </label>

              <input
                id="provider-email"
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
                value="Provider"
                disabled
              />
            </div>


            <div className="profile-field">
              <label>Approval Status</label>

              <input
                type="text"
                value={profile?.status || ""}
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

export default ProviderProfile;
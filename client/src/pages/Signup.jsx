 `src/pages/Signup.jsx`


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const role = formData.role;

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (role !== "customer" && role !== "provider") {
      setError("Please select a valid account type.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
        return;
      }

      // Store the real authentication information returned by the backend.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Use the actual role returned by the backend.
      if (data.user.role === "customer") {
        setSuccess(
          "Account created successfully. Redirecting to your dashboard..."
        );

        navigate("/customer/dashboard");
      } else if (data.user.role === "provider") {
        setSuccess(
          "Account created successfully. Your provider account is pending admin approval."
        );

        navigate("/provider/dashboard");
      } else {
        // This should not happen because public signup only allows
        // customer and provider accounts.
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError("Your account has an invalid role.");
      }
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-intro">
          <span className="login-eyebrow">JOIN SKILLBRIDGE</span>

          <h1>
            Build your journey with
            <span>SkillBridge.</span>
          </h1>

          <p>
            Create your account to discover professional services or offer
            your own skills to customers looking for trusted providers.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="login-brand-mark">S</div>

            <div>
              <h2>Create account</h2>
              <p>Join the SkillBridge marketplace.</p>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div
              className="login-success"
              role="status"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                disabled={loading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
                minLength={6}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="role">Account type</label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="customer">Customer</option>
                <option value="provider">Provider</option>
              </select>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="login-signup">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;


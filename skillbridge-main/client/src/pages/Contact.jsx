import { useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(
          data.message ||
            "Unable to submit your message. Please try again."
        );
        return;
      }

      setSuccessMessage(
        data.message ||
          "Your message was submitted successfully."
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error(
        "Contact form submission error:",
        error
      );

      setSubmitError(
        "Unable to connect to the SkillBridge server. Please make sure the backend is running and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <section className="section">
        <div className="section-heading">
          <span>CONTACT SKILLBRIDGE</span>

          <h1>Get in Touch</h1>

          <p>
            Have a question or want to get in touch with
            SkillBridge? Send us a message using the form below.
          </p>
        </div>

        <div className="login-container">
          <form
            className="login-card"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="login-field">
              <label htmlFor="contact-name">
                Name
              </label>

              <input
                id="contact-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name
                    ? "contact-name-error"
                    : undefined
                }
              />

              {errors.name && (
                <p
                  id="contact-name-error"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="contact-email">
                Email
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email
                    ? "contact-email-error"
                    : undefined
                }
              />

              {errors.email && (
                <p
                  id="contact-email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="contact-subject">
                Subject
              </label>

              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What would you like to ask?"
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={
                  errors.subject
                    ? "contact-subject-error"
                    : undefined
                }
              />

              {errors.subject && (
                <p
                  id="contact-subject-error"
                  role="alert"
                >
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message"
                rows="7"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message
                    ? "contact-message-error"
                    : undefined
                }
              />

              {errors.message && (
                <p
                  id="contact-message-error"
                  role="alert"
                >
                  {errors.message}
                </p>
              )}
            </div>

            {submitError && (
              <div
                className="dashboard-error"
                role="alert"
              >
                <p>{submitError}</p>
              </div>
            )}

            {successMessage && (
              <div
                className="admin-success-message"
                role="status"
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Contact;
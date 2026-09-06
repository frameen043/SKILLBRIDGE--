import { useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function ReviewForm({
  requestId,
  serviceId,
  providerId,
  onSuccess,
  onCancel,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!rating) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to leave a review.");
      return;
    }

    if (!requestId || !serviceId || !providerId) {
      setError("Review information is incomplete. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          providerId,
          requestId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        throw new Error(data.message || "Failed to submit review.");
      }

      setSuccess("Your review has been submitted successfully.");
      setComment("");
      setRating(0);
      setHoverRating(0);

      if (onSuccess) {
        onSuccess(data.review || data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  const displayedRating = hoverRating || rating;

  return (
    <div className="review-form">
      <div className="review-form-header">
        <span className="dashboard-eyebrow">LEAVE A REVIEW</span>
        <h3>Share your experience</h3>
        <p>
          Tell others about your experience with this service and professional.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="review-form-field">
          <label>Rating</label>

          <div
            className="review-stars"
            onMouseLeave={() => setHoverRating(0)}
            aria-label="Select a rating from 1 to 5 stars"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`review-star ${
                  star <= displayedRating ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating === star}
                disabled={loading}
              >
                {star <= displayedRating ? "★" : "☆"}
              </button>
            ))}
          </div>

          {rating > 0 && (
            <span className="review-rating-text">
              {rating} out of 5
            </span>
          )}
        </div>

        <div className="review-form-field">
          <label htmlFor="review-comment">Comment</label>

          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share your experience..."
            rows="5"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="review-form-message review-form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="review-form-message review-form-success">
            {success}
          </div>
        )}

        <div className="review-form-actions">
          <button
            type="submit"
            className="dashboard-primary-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>

          {onCancel && (
            <button
              type="button"
              className="dashboard-services-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
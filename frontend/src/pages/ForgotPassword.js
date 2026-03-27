import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const normalizedResetUrl =
    resetUrl &&
    typeof window !== "undefined" &&
    window.location.origin &&
    resetUrl.startsWith("http://localhost:3000")
      ? resetUrl.replace("http://localhost:3000", window.location.origin)
      : resetUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email, role);
      setMessage(
        response.message ||
          "If an account exists with that email, a password reset link has been sent.",
      );
      if (response.resetUrl) {
        setResetUrl(response.resetUrl);
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map((item) => item.msg).join(", "));
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to process forgot password request.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and role to receive a password reset link.
        </p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        {normalizedResetUrl && (
          <div className="success-message">
            Reset link for local testing:{" "}
            <a href={normalizedResetUrl}>{normalizedResetUrl}</a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-link">
          Remembered your password? <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

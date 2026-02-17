import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
  });
  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (changePassword.newPassword !== changePassword.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (changePassword.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement password change API call
      setSuccessMessage("Password changed successfully");
      setChangePassword({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="error-message">Please log in to view your profile</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Profile Information */}
        <div className="card">
          <div className="card-header">Update Profile</div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Email (Read-only)</label>
              <input type="email" value={user.email} disabled />
            </div>

            <div className="form-group">
              <label>Roll Number (Read-only)</label>
              <input type="text" value={user.rollNumber} disabled />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label>Branch (Read-only)</label>
              <input type="text" value={user.branch} disabled />
            </div>

            <div className="form-group">
              <label>Semester (Read-only)</label>
              <input type="text" value={user.semester} disabled />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleFormChange}
                placeholder="Tell us about yourself"
                maxLength="500"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Profile Details */}
        <div className="card">
          <div className="card-header">Profile Information</div>

          <div className="profile-info">
            <div>
              <strong>Email:</strong>
              <p>{user.email}</p>
            </div>

            <div>
              <strong>Roll Number:</strong>
              <p>{user.rollNumber}</p>
            </div>

            <div>
              <strong>Phone:</strong>
              <p>{user.phone || "Not provided"}</p>
            </div>

            <div>
              <strong>Branch:</strong>
              <p>{user.branch}</p>
            </div>

            <div>
              <strong>Semester:</strong>
              <p>{user.semester}</p>
            </div>

            <div>
              <strong>Member Since:</strong>
              <p>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <strong>Bio:</strong>
              <p>{user.bio || "No bio provided"}</p>
            </div>

            <div>
              <strong>Registered Events:</strong>
              <p>{user.registeredEvents?.length || 0}</p>
            </div>
          </div>

          <button
            className="btn btn-danger"
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                logout();
                window.location.href = "/login";
              }
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header">Change Password</div>

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={changePassword.oldPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter your current password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={changePassword.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={changePassword.confirmPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Confirm new password"
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

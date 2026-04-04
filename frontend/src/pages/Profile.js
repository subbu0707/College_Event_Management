import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const isStudent = user?.role === "student";
  const showSemester = isStudent;
  const idLabel = user?.role === "admin" ? "Admin ID" : "Organizer ID";
  const showRegisteredEvents = user?.role === "student";
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    semester: "",
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
        semester: user.semester || "",
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
      setIsEditMode(false);
      setActiveSection("profile");
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
        <div className="profile-cover-glow" />
        <div className="profile-header-content">
          <div className="profile-avatar">👤</div>
          <div className="profile-identity">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="profile-meta-row">
            <span className="profile-meta-pill">
              {user.branch || "Branch not set"}
            </span>
            {showSemester && (
              <span className="profile-meta-pill">
                Semester {user.semester || "N/A"}
              </span>
            )}
            {showRegisteredEvents && (
              <span className="profile-meta-pill">
                {user.registeredEvents?.length || 0} Events
              </span>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {!isEditMode ? (
        <>
          {/* Profile Information View */}
          <div className="card">
            <div className="card-header">Profile Information</div>

            <div className="profile-info">
              <div>
                <strong>Full Name:</strong>
                <p>{user.name}</p>
              </div>

              <div>
                <strong>Email:</strong>
                <p>{user.email}</p>
              </div>

              <div>
                <strong>{isStudent ? "Roll Number" : idLabel}:</strong>
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

              {showSemester && (
                <div>
                  <strong>Semester:</strong>
                  <p>{user.semester}</p>
                </div>
              )}

              <div>
                <strong>Bio:</strong>
                <p>{user.bio || "No bio provided"}</p>
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

              {showRegisteredEvents && (
                <div>
                  <strong>Registered Events:</strong>
                  <p>{user.registeredEvents?.length || 0}</p>
                </div>
              )}
            </div>

            <div className="profile-action-row">
              <button
                className="btn btn-primary btn-compact"
                onClick={() => {
                  setIsEditMode(true);
                  setActiveSection("profile");
                }}
              >
                Update Profile
              </button>
              <button
                className="btn btn-secondary btn-compact"
                onClick={() => {
                  setIsEditMode(true);
                  setActiveSection("password");
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="profile-subnav">
            <button
              className={`btn btn-small profile-tab ${activeSection === "profile" ? "active" : ""}`}
              onClick={() => setActiveSection("profile")}
            >
              Update Profile
            </button>
            <button
              className={`btn btn-small profile-tab ${activeSection === "password" ? "active" : ""}`}
              onClick={() => setActiveSection("password")}
            >
              Change Password
            </button>
            <button
              className="btn btn-small btn-secondary profile-tab"
              onClick={() => {
                setIsEditMode(false);
                setActiveSection("profile");
              }}
            >
              Back
            </button>
          </div>

          {/* Update Profile Form */}
          <div
            className="card profile-panel"
            style={{
              marginBottom: "1.25rem",
              display: activeSection === "password" ? "none" : "block",
            }}
          >
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
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="profile-readonly-field"
                />
              </div>

              <div className="form-group">
                <label>{isStudent ? "Roll Number" : idLabel} (Read-only)</label>
                <input
                  type="text"
                  value={user.rollNumber}
                  readOnly
                  className="profile-readonly-field"
                />
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
                <input
                  type="text"
                  value={user.branch}
                  readOnly
                  className="profile-readonly-field"
                />
              </div>

              {showSemester && (
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleFormChange}
                    min="1"
                    max="8"
                  />
                </div>
              )}

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
                className="btn btn-primary btn-compact"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div
            className="card profile-panel"
            style={{
              marginBottom: "1.25rem",
              display: activeSection === "profile" ? "none" : "block",
            }}
          >
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
                className="btn btn-primary btn-compact"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;

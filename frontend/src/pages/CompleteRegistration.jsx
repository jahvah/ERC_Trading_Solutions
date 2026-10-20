
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CompleteRegistration() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const registrationToken = sessionStorage.getItem("registrationToken");
  const registrationEmail = sessionStorage.getItem("registrationEmail");

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    username: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    password: "",
    confirmPassword: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG or PNG image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Profile picture must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setProfilePicture(file);
    setProfilePreview(previewUrl);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!registrationToken || !registrationEmail) {
      setMessage(
        "Your registration session is missing or has expired. Please start again."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const submissionData = new FormData();

      submissionData.append("registrationToken", registrationToken);
      submissionData.append("fname", formData.fname.trim());
      submissionData.append("lname", formData.lname.trim());
      submissionData.append("username", formData.username.trim());
      submissionData.append("phone", formData.phone.trim());
      submissionData.append("password", formData.password);
      submissionData.append("confirmPassword", formData.confirmPassword);

      if (formData.gender) {
        submissionData.append("gender", formData.gender);
      }

      if (formData.date_of_birth) {
        submissionData.append("date_of_birth", formData.date_of_birth);
      }

      if (profilePicture) {
        submissionData.append("profile_image", profilePicture);
      }

      const response = await api.post(
        "/users/complete-registration",
        submissionData
      );

      sessionStorage.removeItem("registrationToken");
      sessionStorage.removeItem("registrationEmail");

      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!registrationToken || !registrationEmail) {
    return (
      <div>
        <h1>Registration Session Not Found</h1>
        <p>Please enter your email address to start registration.</p>
        <Link to="/register">Return to Registration</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Complete Your Registration</h1>

      <p>
        Email Address: <strong>{registrationEmail}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="profilePicture">
            Profile Picture (Optional)
          </label>

          <input
            ref={fileInputRef}
            id="profilePicture"
            name="profilePicture"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleProfilePictureChange}
          />

          {profilePreview && (
            <div>
              <p>Image Preview:</p>
              <img
                src={profilePreview}
                alt="Profile picture preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrlRef.current) {
                      URL.revokeObjectURL(previewUrlRef.current);
                      previewUrlRef.current = "";
                    }

                    setProfilePicture(null);
                    setProfilePreview("");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remove Picture
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="fname">First Name *</label>
          <input
            id="fname"
            name="fname"
            type="text"
            value={formData.fname}
            onChange={handleChange}
            autoComplete="given-name"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="lname">Last Name *</label>
          <input
            id="lname"
            name="lname"
            type="text"
            value={formData.lname}
            onChange={handleChange}
            autoComplete="family-name"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_.-]+"
            title="Use 3–30 letters, numbers, dots, underscores, or hyphens."
            required
          />
        </div>

        <div>
          <label htmlFor="phone">Contact Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            maxLength={30}
            required
          />
        </div>

        <div>
          <label htmlFor="gender">Gender (Optional)</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Prefer not to specify</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="date_of_birth">Date of Birth (Optional)</label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <small>Password must contain at least 8 characters.</small>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {message && <p role="alert">{message}</p>}

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default CompleteRegistration;

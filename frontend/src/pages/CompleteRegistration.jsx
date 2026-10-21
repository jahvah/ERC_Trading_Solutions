
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
    title: "",
    fname: "",
    lname: "",
    username: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    addressline: "",
    town: "",
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

    const requiredFields = [
      ["title", "Please select a title."],
      ["fname", "Please enter your first name."],
      ["lname", "Please enter your last name."],
      ["username", "Please enter a username."],
      ["phone", "Please enter your contact number."],
      ["gender", "Please select your gender."],
      ["date_of_birth", "Please enter your date of birth."],
      ["addressline", "Please enter your address line."],
      ["town", "Please enter your town or city."],
      ["password", "Please enter a password."],
      ["confirmPassword", "Please confirm your password."],
    ];

    for (const [field, errorMessage] of requiredFields) {
      if (!formData[field].trim()) {
        setMessage(errorMessage);
        return;
      }
    }

    if (formData.username.trim().length < 3) {
      setMessage("Username must contain at least 3 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const birthDate = new Date(`${formData.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(birthDate.getTime()) ||
      birthDate > today
    ) {
      setMessage("Please enter a valid date of birth that is not in the future.");
      return;
    }

    setLoading(true);

    try {
      const submissionData = new FormData();

      submissionData.append("registrationToken", registrationToken);
      submissionData.append("title", formData.title);
      submissionData.append("fname", formData.fname.trim());
      submissionData.append("lname", formData.lname.trim());
      submissionData.append("username", formData.username.trim());
      submissionData.append("phone", formData.phone.trim());
      submissionData.append("gender", formData.gender);
      submissionData.append("date_of_birth", formData.date_of_birth);
      submissionData.append("addressline", formData.addressline.trim());
      submissionData.append("town", formData.town.trim());
      submissionData.append("password", formData.password);
      submissionData.append("confirmPassword", formData.confirmPassword);

      if (profilePicture) {
        submissionData.append("profile_image", profilePicture);
      }

      const response = await api.post(
        "/users/complete-registration",
        submissionData
      );

      sessionStorage.removeItem("registrationToken");
      sessionStorage.removeItem("registrationEmail");

      alert(response.data.message || "Registration completed successfully.");
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

      <p>* Required fields</p>

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
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

        {/* Title */}
        <div>
          <label htmlFor="title">Title *</label>

          <select
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          >
            <option value="">Select title</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
        </div>

        {/* First Name */}
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

        {/* Last Name */}
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

        {/* Username */}
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

        {/* Contact Number */}
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

        {/* Gender */}
        <div>
          <label htmlFor="gender">Gender *</label>

          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="date_of_birth">Date of Birth *</label>

          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            max={new Date().toLocaleDateString("en-CA")}
            required
          />
        </div>

        {/* Address Line */}
        <div>
          <label htmlFor="addressline">Address Line *</label>

          <input
            id="addressline"
            name="addressline"
            type="text"
            value={formData.addressline}
            onChange={handleChange}
            autoComplete="street-address"
            maxLength={200}
            placeholder="House number, street, or building"
            required
          />
        </div>

        {/* Town / City */}
        <div>
          <label htmlFor="town">Town / City *</label>

          <input
            id="town"
            name="town"
            type="text"
            value={formData.town}
            onChange={handleChange}
            autoComplete="address-level2"
            maxLength={200}
            required
          />
        </div>

        {/* Password */}
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

        {/* Confirm Password */}
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
 
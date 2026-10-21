import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getToken, getUser } from "../utils/auth";
import CustomerNavbar from "../components/CustomerNavbar";

const API_SERVER = "http://localhost:3000";

function getImageUrl(filename) {
  if (!filename || typeof filename !== "string") {
    return "/default-profile.png";
  }

  if (/^https?:\/\//i.test(filename)) {
    return filename;
  }

  const cleanFilename = filename.replace(/\\/g, "/").split("/").pop();

  return `${API_SERVER}/profileUpload/${encodeURIComponent(cleanFilename)}`;
}

function getCustomerForm(user) {
  const customer = user?.customer || {};

  return {
    title: customer.title || "",
    fname: customer.fname || "",
    lname: customer.lname || "",
    phone: customer.phone || "",
    gender: customer.gender || "",
    date_of_birth: customer.date_of_birth
      ? new Date(customer.date_of_birth).toISOString().slice(0, 10)
      : "",
    addressline: customer.addressline || "",
    town: customer.town || "",
  };
}

function Profile() {

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(getCustomerForm(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please log in to view your profile.");
        return;
      }

      const response = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = response.data.user;

      setUser(profile);
      setFormData(getCustomerForm(profile));
      setImageError(false);

      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("Fetch profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const original = user?.customer || {};

      const fields = [
        "title",
        "fname",
        "lname",
        "phone",
        "gender",
        "date_of_birth",
        "addressline",
        "town",
      ];

      const changedFields = {};

      fields.forEach((field) => {
        const originalValue =
          field === "date_of_birth" && original[field]
            ? new Date(original[field]).toISOString().slice(0, 10)
            : String(original[field] ?? "");

        const currentValue = String(formData[field] ?? "").trim();

        // Ignore blank values so they cannot accidentally erase saved data.
        if (currentValue === "" && originalValue !== "") {
          return;
        }

        if (currentValue !== originalValue) {
          changedFields[field] = currentValue;
        }
      });

      // Keep editing enabled if nothing has changed.
      if (Object.keys(changedFields).length === 0) {
        setMessage("");
        setError("");
        return;
      }

      const response = await api.put("/users/profile", changedFields, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const updatedUser = response.data.user;

      setUser(updatedUser);
      setFormData(getCustomerForm(updatedUser));

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);
      setMessage(response.data.message || "Profile updated successfully.");
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(getCustomerForm(user));
    setEditing(false);
    setError("");
    setMessage("");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={styles.container}>
        <h1>My Profile</h1>
        <p style={styles.error}>{error}</p>

        <button type="button" style={styles.button} onClick={fetchProfile}>
          Try Again
        </button>

        <p>
          <Link to="/shop">Back to Shop</Link>
        </p>
      </div>
    );
  }

  const storedUser = getUser();
  const imageFilename = user?.profile_image || user?.customer?.image_path;
  const profileImage = getImageUrl(imageFilename);

  return (
    <div style={styles.container}>

        <CustomerNavbar />

      <main style={styles.card}>
        <h1 style={styles.heading}>My Profile</h1>

        <p style={styles.subtitle}>
          View and manage your personal information.
        </p>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <section style={styles.pictureSection}>
          <img
            key={profileImage}
            src={imageError ? "/default-profile.png" : profileImage}
            alt="Profile"
            style={styles.profilePicture}
            onError={() => setImageError(true)}
          />

          <h3 style={styles.customerName}>
            {[user?.customer?.fname, user?.customer?.lname]
              .filter(Boolean)
              .join(" ") || "Customer"}
          </h3>

          <p style={styles.pictureCaption}>Profile Picture</p>
        </section>

        <section style={styles.accountInfo}>
          <h3 style={styles.sectionHeading}>Account Information</h3>

          <p>
            <strong>Email:</strong>{" "}
            {user?.email || storedUser?.email || "Not available"}
          </p>

          <p>
            <strong>Username:</strong>{" "}
            {user?.username || storedUser?.username || "Not available"}
          </p>

          <p>
            <strong>Account status:</strong> {user?.status || "Not available"}
          </p>
        </section>

        <hr style={styles.divider} />

        <form onSubmit={handleSave}>
          <h3 style={styles.sectionHeading}>Personal Information</h3>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label htmlFor="title">Title</label>
              <select
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!editing || saving}
              >
                <option value="">Select title</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="fname">First Name</label>
              <input
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                disabled={!editing || saving}
                required
                maxLength={100}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="lname">Last Name</label>
              <input
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                disabled={!editing || saving}
                required
                maxLength={100}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="phone">Contact Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing || saving}
                maxLength={30}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!editing || saving}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div style={styles.field}>
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={!editing || saving}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="addressline">Address</label>
              <input
                id="addressline"
                name="addressline"
                value={formData.addressline}
                onChange={handleChange}
                disabled={!editing || saving}
                maxLength={200}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="town">City / Town</label>
              <input
                id="town"
                name="town"
                value={formData.town}
                onChange={handleChange}
                disabled={!editing || saving}
                maxLength={200}
              />
            </div>
          </div>

          <div style={styles.actions}>
            {!editing ? (
              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    ...(saving ? styles.disabledButton : {}),
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "Arial, sans-serif",
    color: "#222",
  },
  nav: {
    backgroundColor: "#172554",
    color: "#fff",
    padding: "16px 24px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  brand: {
    margin: 0,
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "16px",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
  },
  card: {
    maxWidth: "850px",
    margin: "32px auto",
    padding: "28px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  },
  heading: {
    marginBottom: "8px",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 0,
  },
  pictureSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    margin: "28px 0",
  },
  profilePicture: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  customerName: {
    margin: "8px 0 0",
  },
  pictureCaption: {
    color: "#6b7280",
    margin: 0,
    fontSize: "14px",
  },
  accountInfo: {
    lineHeight: "1.8",
    overflowWrap: "anywhere",
  },
  sectionHeading: {
    marginBottom: "12px",
  },
  divider: {
    border: 0,
    borderTop: "1px solid #e5e7eb",
    margin: "24px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "24px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  button: {
    padding: "10px 18px",
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  cancelButton: {
    padding: "10px 18px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "8px 12px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
  },
  success: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "10px",
    borderRadius: "5px",
  },
  error: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: "10px",
    borderRadius: "5px",
  },
  loading: {
    padding: "24px",
  },
};

export default Profile;

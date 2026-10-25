
export default function ProfileForm({
  formData,
  editing,
  saving,
  onChange,
  onSubmit,
  onEdit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h3 style={styles.heading}>Personal Information</h3>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label htmlFor="title">Title</label>
          <select
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            disabled={!editing || saving}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="addressline">Address</label>
          <input
            id="addressline"
            name="addressline"
            value={formData.addressline}
            onChange={onChange}
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
            onChange={onChange}
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
            onClick={onEdit}
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
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}

const styles = {
  heading: {
    marginBottom: "12px",
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
    minWidth: 0,
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
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
  },
};

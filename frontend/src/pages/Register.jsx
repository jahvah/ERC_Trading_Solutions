import { useState } from "react";
import api from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fname: "",
    lname: "",
    phone: "",
    addressline: "",
    town: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/users/register", {
        email: formData.email,
        password: formData.password,
        customer: {
          fname: formData.fname,
          lname: formData.lname,
          phone: formData.phone,
          addressline: formData.addressline,
          town: formData.town,
        },
      });

      setMessage(response.data.message);

      setFormData({
        email: "",
        password: "",
        fname: "",
        lname: "",
        phone: "",
        addressline: "",
        town: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h1>Register User</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>First Name</label>
          <input
            type="text"
            name="fname"
            value={formData.fname}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lname"
            value={formData.lname}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Address</label>
          <input
            type="text"
            name="addressline"
            value={formData.addressline}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Town</label>
          <input
            type="text"
            name="town"
            value={formData.town}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "../services/api";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email is required."),

  password: Yup.string()
    .required("Password is required."),
});

function Login() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: values.email.trim(),
        password: values.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/shop");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form noValidate>
            <div>
              <label htmlFor="email">Email</label>
              <Field
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                aria-invalid={Boolean(
                  touched.email && errors.email
                )}
                aria-describedby={
                  touched.email && errors.email
                    ? "email-error"
                    : undefined
                }
              />

              {touched.email && errors.email && (
                <p id="email-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <Field
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                aria-invalid={Boolean(
                  touched.password && errors.password
                )}
                aria-describedby={
                  touched.password && errors.password
                    ? "password-error"
                    : undefined
                }
              />

              {touched.password && errors.password && (
                <p id="password-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {message && <p role="alert">{message}</p>}

            <button
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
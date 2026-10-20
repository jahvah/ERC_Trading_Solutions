
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage('')
        setLoading(true)

        try {
            const normalizedEmail = email.trim().toLowerCase()

            const response = await api.post('/users/register', {
                email: normalizedEmail
            })

            // Save the registration token returned by the backend.
            sessionStorage.setItem(
                'registrationToken',
                response.data.registrationToken
            )

            sessionStorage.setItem(
                'registrationEmail',
                normalizedEmail
            )

            navigate('/complete-registration')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Unable to start registration. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Create an Account</h1>

            <p>Enter your email address to get started.</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">
                        Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Please wait...' : 'Continue'}
                </button>
            </form>

            {message && (
                <p role="alert">{message}</p>
            )}

            <p>
                Already have an account?{' '}
                <a href="/login">Log in</a>
            </p>
        </div>
    )
}

export default Register

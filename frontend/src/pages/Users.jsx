import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminNavbar from '../components/AdminNavbar'

function Users() {
    const [users, setUsers] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        getUsers()
    }, [])

    const getUsers = async () => {
        try {
            const response = await api.get('/users')

            setUsers(response.data.users)
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get users'
            )
        }
    }

    return (
        <div>
            <AdminNavbar />

            <h1>Users</h1>

            {message && (
                <p>{message}</p>
            )}

            {users.map((user) => (
                <div key={user._id}>
                    <h3>
                        {user.customer?.fname} {user.customer?.lname}
                    </h3>

                    <p>Email: {user.email}</p>
                    <p>Phone: {user.customer?.phone}</p>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>

                    <hr />
                </div>
            ))}
        </div>
    )
}

export default Users
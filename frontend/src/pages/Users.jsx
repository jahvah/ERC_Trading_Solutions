
import AdminNavbar from '../components/AdminNavbar'
import UserList from '../components/users/UserList'
import useUsers from '../hooks/useUsers'

function Users() {
    const {
        users,
        message,
        loading,
        updatingUserId,
        handleStatusChange
    } = useUsers()

    return (
        <div>
            <AdminNavbar />

            <h1>Users</h1>

            {message && (
                <p role="status">{message}</p>
            )}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <UserList
                    users={users}
                    onStatusChange={handleStatusChange}
                    updatingUserId={updatingUserId}
                />
            )}
        </div>
    )
}

export default Users

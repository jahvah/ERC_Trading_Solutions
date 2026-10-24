
import UserCard from './UserCard'

function UserList({ users, onStatusChange, updatingUserId }) {
    if (users.length === 0) {
        return <p>No users found.</p>
    }

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    minWidth: '750px',
                    borderCollapse: 'collapse',
                    textAlign: 'left'
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={cellStyle}>User</th>
                        <th style={cellStyle}>Email / Username</th>
                        <th style={cellStyle}>Role</th>
                        <th style={cellStyle}>Status</th>
                        <th style={cellStyle}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <UserCard
                            key={user._id}
                            user={user}
                            onStatusChange={onStatusChange}
                            updating={updatingUserId === user._id}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const cellStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap'
}

export default UserList

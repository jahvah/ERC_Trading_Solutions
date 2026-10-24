
function UserCard({ user, onStatusChange, updating }) {
    const isActive = user.status === 'Active'

    const fullName = [
        user.customer?.fname,
        user.customer?.lname
    ].filter(Boolean).join(' ') || user.username || 'Unnamed User'

    const username = user.username
        ? `@${user.username}`
        : '—'

    const cellStyle = {
        padding: '14px 16px',
        borderBottom: '1px solid #e5e7eb',
        verticalAlign: 'middle'
    }

    return (
        <tr>
            <td style={cellStyle}>
                <strong>{fullName}</strong>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    {user.customer?.phone || 'No phone number'}
                </div>
            </td>

            <td style={cellStyle}>
                <div>{user.email}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    {username}
                </div>
            </td>

            <td style={cellStyle}>
                {user.role}
            </td>

            <td style={cellStyle}>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                        color: isActive ? '#166534' : '#991b1b'
                    }}
                >
                    {user.status || 'Unknown'}
                </span>
            </td>

            <td style={cellStyle}>
                <button
                    type="button"
                    onClick={() => onStatusChange(user)}
                    disabled={updating}
                    style={{
                        padding: '8px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: updating ? 'wait' : 'pointer',
                        backgroundColor: isActive ? '#fee2e2' : '#dcfce7',
                        color: isActive ? '#991b1b' : '#166534',
                        fontWeight: '600',
                        opacity: updating ? 0.6 : 1
                    }}
                >
                    {updating
                        ? 'Updating...'
                        : isActive
                            ? 'Deactivate'
                            : 'Activate'}
                </button>
            </td>
        </tr>
    )
}

export default UserCard

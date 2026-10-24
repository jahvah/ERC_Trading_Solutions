
import { useCallback, useEffect, useState } from 'react'
import userService from '../services/userService'

function useUsers() {
    const [users, setUsers] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [updatingUserId, setUpdatingUserId] = useState(null)

    const getUsers = useCallback(async () => {
        try {
            setLoading(true)

            const data = await userService.getUsers()
            setUsers(data.users || [])
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get users.'
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        getUsers()
    }, [getUsers])

    const handleStatusChange = async (user) => {
        const newStatus =
            user.status === 'Active'
                ? 'Deactivated'
                : 'Active'

        const action =
            newStatus === 'Active'
                ? 'activate'
                : 'deactivate'

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this account?`
        )

        if (!confirmed) {
            return
        }

        try {
            setUpdatingUserId(user._id)
            setMessage('')

            const data = await userService.updateUserStatus(
                user._id,
                newStatus
            )

            setMessage(
                data.message ||
                `Account ${action}d successfully.`
            )

            await getUsers()
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update account status.'
            )
        } finally {
            setUpdatingUserId(null)
        }
    }

    return {
        users,
        message,
        loading,
        updatingUserId,
        getUsers,
        handleStatusChange
    }
}

export default useUsers

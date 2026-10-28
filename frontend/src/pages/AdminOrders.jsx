
import { useEffect, useState } from 'react'
import api from '../services/api'
import { getToken } from '../utils/auth'
import AdminNavbar from '../components/AdminNavbar'
import AdminOrderCard from '../components/adminOrders/AdminOrderCard'

const FINAL_STATUSES = ['Delivered', 'Cancelled']

function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [loading, setLoading] = useState(true)
    const [updatingOrderId, setUpdatingOrderId] = useState(null)

    useEffect(() => {
        getOrders()
    }, [])

    const getOrders = async () => {
        try {
            setLoading(true)
            setMessage('')
            setMessageType('')

            const response = await api.get('/orders/admin/all', {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            setOrders(response.data.orders || [])
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get orders'
            )
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (orderId, status) => {
        const order = orders.find(
            (item) => item._id === orderId
        )

        if (!order) {
            setMessage('Order not found.')
            setMessageType('error')
            return
        }

        if (FINAL_STATUSES.includes(order.status)) {
            setMessage(
                'Delivered or cancelled orders cannot be updated.'
            )
            setMessageType('error')
            return
        }

        if (updatingOrderId !== null || order.status === status) {
            return
        }

        try {
            setUpdatingOrderId(orderId)
            setMessage('')
            setMessageType('')

            const response = await api.put(
                `/orders/admin/${orderId}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setOrders((previousOrders) =>
                previousOrders.map((item) =>
                    item._id === orderId
                        ? { ...item, status }
                        : item
                )
            )

            setMessage(
                response.data.message ||
                'Order status updated successfully.'
            )
            setMessageType('success')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update order status.'
            )
            setMessageType('error')
        } finally {
            setUpdatingOrderId(null)
        }
    }

    return (
        <div>
            <AdminNavbar />

            <main style={{ padding: '20px' }}>
                <h1>Admin Orders</h1>

                {message && (
                    <p
                        role="status"
                        style={{
                            color:
                                messageType === 'error'
                                    ? 'red'
                                    : 'green'
                        }}
                    >
                        {message}
                    </p>
                )}

                {loading ? (
                    <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    orders.map((order) => (
                        <AdminOrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={updateStatus}
                            updating={updatingOrderId === order._id}
                        />
                    ))
                )}
            </main>
        </div>
    )
}

export default AdminOrders

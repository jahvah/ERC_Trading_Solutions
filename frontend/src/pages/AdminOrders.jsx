import { useEffect, useState } from 'react'
import api from '../services/api'
import { getToken } from '../utils/auth'
import AdminNavbar from '../components/AdminNavbar'

function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        getOrders()
    }, [])

    const getOrders = async () => {
        try {
            const response = await api.get('/orders/admin/all', {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            })

            setOrders(response.data.orders)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get orders'
            )
        }
    }

    const updateStatus = async (orderId, status) => {
        try {
            const response = await api.put(
                `/orders/admin/${orderId}`,
                {
                    status
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setMessage(response.data.message)

            getOrders()

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to update order status'
            )
        }
    }

    return (
        <div>
            <AdminNavbar />

            <h1>Admin Orders</h1>

            {message && (
                <p>{message}</p>
            )}

            {orders.length === 0 && !message && (
                <p>No orders found.</p>
            )}

            {orders.map((order) => (
                <div key={order._id}>
                    <h2>
                        Order ID: {order._id}
                    </h2>

                    <p>
                        Customer: {
                            order.customer?.customer?.fname
                        } {
                            order.customer?.customer?.lname
                        }
                    </p>

                    <p>
                        Email: {order.customer?.email}
                    </p>

                    <p>
                        Date Placed: {
                            new Date(
                                order.date_placed
                            ).toLocaleString()
                        }
                    </p>

                    <p>
                        Status: {order.status}
                    </p>

                    <label>
                        Change Status:
                    </label>

                    <select
                        value={order.status}
                        onChange={(e) =>
                            updateStatus(
                                order._id,
                                e.target.value
                            )
                        }
                    >
                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Shipped">
                            Shipped
                        </option>

                        <option value="Delivered">
                            Delivered
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                    <h3>Order Items</h3>

                    {order.order_lines.map((line) => (
                        <div key={line._id}>
                            <p>
                                Item: {
                                    line.item?.item_name
                                }
                            </p>

                            <p>
                                Quantity: {line.quantity}
                            </p>

                            <p>
                                Price: {line.price}
                            </p>
                        </div>
                    ))}

                    <hr />
                </div>
            ))}
        </div>
    )
}

export default AdminOrders

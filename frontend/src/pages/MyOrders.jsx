import { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import api from '../services/api'
import { getToken } from '../utils/auth'
import CustomerNavbar from "../components/CustomerNavbar";

function MyOrders() {
    const [orders, setOrders] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        getOrders()
    }, [])

    const getOrders = async () => {
        try {
            const response = await api.get('/orders', {
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

    return (
        <div>

             <CustomerNavbar />
             
            <h1>My Orders</h1>

            {message && (
                <p>{message}</p>
            )}

            {orders.length === 0 && !message && (
                <p>You have no orders yet.</p>
            )}

            {orders.map((order) => (
                <div key={order._id}>
                    <h2>
                        Order ID: {order._id}
                    </h2>

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

                    <h3>Order Items</h3>

                    {order.order_lines.map((line) => (
                        <div key={line._id}>
                            <p>
                                Item: {line.item?.item_name}
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

export default MyOrders


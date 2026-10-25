
import { useEffect, useState } from 'react'
import api from '../services/api'
import { getToken } from '../utils/auth'
import CustomerNavbar from '../components/CustomerNavbar'
import ReviewForm from '../components/reviews/ReviewForm'

function Reviews() {
    const [orders, setOrders] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [submittingKey, setSubmittingKey] = useState(null)

    // Track reviews separately for each order-item combination.
    const [submittedReviews, setSubmittedReviews] = useState({})

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await api.get('/orders', {
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
            } finally {
                setLoading(false)
            }
        }

        getOrders()
    }, [])

    const submitReview = async (orderId, itemId, values) => {
        const key = `${orderId}:${itemId}`

        try {
            setSubmittingKey(key)
            setMessage('')

            const response = await api.post(
                '/reviews',
                {
                    order_id: orderId,
                    item_id: itemId,
                    rating: values.rating,
                    review_text: values.review_text
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setSubmittedReviews((previous) => ({
                ...previous,
                [key]: response.data.review || values
            }))

            setMessage(response.data.message || 'Review submitted successfully')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to submit review'
            )
        } finally {
            setSubmittingKey(null)
        }
    }

    if (loading) {
        return (
            <>
                <CustomerNavbar />
                <p>Loading orders...</p>
            </>
        )
    }

    return (
        <>
            <CustomerNavbar />

            <main>
                <h1>Reviews</h1>

                {message && <p role="status">{message}</p>}

                {orders.length === 0 && (
                    <p>You have no orders to review.</p>
                )}

                {orders.map((order) => (
                    <section key={order._id}>
                        <h2>Order #{order._id}</h2>

                        {order.order_lines?.map((line, index) => {
                            const item = line.item

                            if (!item) return null

                            const key = `${order._id}:${item._id}`
                            const submittedReview = submittedReviews[key]

                            return (
                                <article key={`${key}:${index}`}>
                                    <h3>{item.item_name}</h3>

                                    <p>
                                        Quantity ordered: {line.quantity}
                                    </p>

                                    {submittedReview ? (
                                        <div>
                                            <p>Review submitted for this order.</p>
                                            <p>
                                                Rating: {submittedReview.rating}
                                            </p>
                                            <p>
                                                {submittedReview.review_text}
                                            </p>
                                        </div>
                                    ) : (
                                        <ReviewForm
                                            key={key}
                                            onSubmit={(values) =>
                                                submitReview(
                                                    order._id,
                                                    item._id,
                                                    values
                                                )
                                            }
                                            submitLabel={
                                                submittingKey === key
                                                    ? 'Submitting...'
                                                    : 'Review Item'
                                            }
                                        />
                                    )}

                                    <hr />
                                </article>
                            )
                        })}
                    </section>
                ))}
            </main>
        </>
    )
}

export default Reviews

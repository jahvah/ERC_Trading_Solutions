import { useEffect, useState } from 'react'
import api from '../services/api'
import { getToken } from '../utils/auth'

function Reviews() {
    const [orders, setOrders] = useState([])
    const [message, setMessage] = useState('')
    const [reviewData, setReviewData] = useState({})

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

    const handleChange = (itemId, field, value) => {
        setReviewData({
            ...reviewData,
            [itemId]: {
                ...reviewData[itemId],
                [field]: value
            }
        })
    }

    const submitReview = async (itemId) => {
        try {
            const review = reviewData[itemId]

            if (!review?.rating || !review?.review_text) {
                setMessage(
                    'Please enter a rating and review'
                )

                return
            }

            const response = await api.post(
                '/reviews',
                {
                    item_id: itemId,
                    rating: Number(review.rating),
                    review_text: review.review_text
                },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setMessage(response.data.message)

            setReviewData({
                ...reviewData,
                [itemId]: {
                    rating: '',
                    review_text: ''
                }
            })

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to submit review'
            )
        }
    }

    const reviewedItems = new Set()

    return (
        <div>
            <h1>Reviews</h1>

            {message && (
                <p>{message}</p>
            )}

            {orders.length === 0 && (
                <p>
                    You have no orders to review.
                </p>
            )}

            {orders.map((order) => (
                <div key={order._id}>
                    {order.order_lines.map((line) => {
                        const item = line.item

                        if (!item) {
                            return null
                        }

                        if (reviewedItems.has(item._id)) {
                            return null
                        }

                        reviewedItems.add(item._id)

                        return (
                            <div key={item._id}>
                                <h2>
                                    {item.item_name}
                                </h2>

                                <p>
                                    Quantity ordered: {
                                        line.quantity
                                    }
                                </p>

                                <div>
                                    <label>
                                        Rating:
                                    </label>

                                    <select
                                        value={
                                            reviewData[
                                                item._id
                                            ]?.rating || ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                item._id,
                                                'rating',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select rating
                                        </option>

                                        <option value="1">
                                            1 - Poor
                                        </option>

                                        <option value="2">
                                            2 - Fair
                                        </option>

                                        <option value="3">
                                            3 - Good
                                        </option>

                                        <option value="4">
                                            4 - Very Good
                                        </option>

                                        <option value="5">
                                            5 - Excellent
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label>
                                        Review:
                                    </label>

                                    <textarea
                                        value={
                                            reviewData[
                                                item._id
                                            ]?.review_text || ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                item._id,
                                                'review_text',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Write your review"
                                    />
                                </div>

                                <button
                                    onClick={() =>
                                        submitReview(
                                            item._id
                                        )
                                    }
                                >
                                    Submit Review
                                </button>

                                <hr />
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

export default Reviews
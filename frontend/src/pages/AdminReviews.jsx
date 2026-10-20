import { useEffect, useState } from 'react'
import api from '../services/api'
import { getToken } from '../utils/auth'
import AdminNavbar from '../components/AdminNavbar'

function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        getReviews()
    }, [])

    const getReviews = async () => {
        try {
            const response = await api.get(
                '/reviews/admin/all',
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setReviews(response.data.reviews)

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to get reviews'
            )
        }
    }

    const deleteReview = async (reviewId) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this review?'
        )

        if (!confirmed) {
            return
        }

        try {
            const response = await api.delete(
                `/reviews/admin/${reviewId}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            )

            setMessage(response.data.message)

            getReviews()

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to delete review'
            )
        }
    }

    return (
        <div>
            <AdminNavbar />

            <h1>Admin Reviews</h1>

            {message && (
                <p>{message}</p>
            )}

            {reviews.length === 0 && !message && (
                <p>No reviews found.</p>
            )}

            {reviews.map((review) => (
                <div key={review._id}>
                    <h3>
                        Item: {review.item?.item_name}
                    </h3>

                    <p>
                        Customer: {
                            review.customer?.customer?.fname
                        } {
                            review.customer?.customer?.lname
                        }
                    </p>

                    <p>
                        Email: {review.customer?.email}
                    </p>

                    <p>
                        Rating: {review.rating} / 5
                    </p>

                    <p>
                        Review: {review.review_text}
                    </p>

                    <p>
                        Date: {
                            review.created_at
                                ? new Date(
                                    review.created_at
                                ).toLocaleString()
                                : 'Not available'
                        }
                    </p>

                    <button
                        onClick={() =>
                            deleteReview(review._id)
                        }
                    >
                        Delete Review
                    </button>

                    <hr />
                </div>
            ))}
        </div>
    )
}

export default AdminReviews
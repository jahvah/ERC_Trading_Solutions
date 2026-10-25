import { useState } from 'react'
import * as yup from 'yup'

const reviewSchema = yup.object({
    rating: yup
        .number()
        .typeError('Please select a rating')
        .integer('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .required('Please select a rating'),

    review_text: yup
        .string()
        .trim()
        .required('Please write a review')
        .max(1000, 'Review must not exceed 1000 characters')
})

function ReviewForm({
    onSubmit,
    initialValues,
    submitLabel = 'Review Item'
}) {
    const [rating, setRating] = useState(
        initialValues?.rating || ''
    )
    const [reviewText, setReviewText] = useState(
        initialValues?.review_text || ''
    )
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        let values

        try {
            values = await reviewSchema.validate(
                {
                    rating,
                    review_text: reviewText
                },
                {
                    abortEarly: false
                }
            )
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                const validationErrors = {}

                error.inner.forEach((err) => {
                    if (err.path && !validationErrors[err.path]) {
                        validationErrors[err.path] = err.message
                    }
                })

                setErrors(validationErrors)
            }

            return
        }

        setSubmitting(true)

        try {
            await onSubmit({
                rating: Number(values.rating),
                review_text: values.review_text
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="review-rating">Rating:</label>

                <select
                    id="review-rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    aria-invalid={Boolean(errors.rating)}
                >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                </select>

                {errors.rating && (
                    <p role="alert">{errors.rating}</p>
                )}
            </div>

            <div>
                <label htmlFor="review-text">Review:</label>

                <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review"
                    maxLength={1000}
                    aria-invalid={Boolean(errors.review_text)}
                />

                {errors.review_text && (
                    <p role="alert">{errors.review_text}</p>
                )}

                <small>{reviewText.length}/1000 characters</small>
            </div>

            <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : submitLabel}
            </button>
        </form>
    )
}

export default ReviewForm

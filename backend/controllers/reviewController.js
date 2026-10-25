const Item = require('../models/itemModel')
const Order = require('../models/orderModel')
const maskBadWords = require('../utils/profanityFilter')

// Create review
const createReview = async (req, res) => {
    try {
        const userId = req.user.id

        const {
            item_id,
            rating,
            review_text
        } = req.body

        // Validate item ID
        if (!item_id) {
            return res.status(400).json({
                message: 'Item ID is required'
            })
        }

        // Validate review text
        if (
            typeof review_text !== 'string' ||
            !review_text.trim()
        ) {
            return res.status(400).json({
                message: 'Review text is required'
            })
        }

        // Validate rating
        const numericRating = Number(rating)

        if (
            rating === undefined ||
            rating === null ||
            rating === '' ||
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: 'Rating must be a whole number between 1 and 5'
            })
        }

        // Find item
        const item = await Item.findById(item_id)

        if (!item || item.deleted_at != null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        // Check whether the customer ordered this item
        const order = await Order.findOne({
            customer: userId,
            'order_lines.item': item_id,
            deleted_at: null
        })

        if (!order) {
            return res.status(403).json({
                message: 'You can only review items you have ordered'
            })
        }

        // Mask profanity before saving the review
        const cleanedReviewText = maskBadWords(
            review_text.trim()
        )

        // Save review
        item.reviews.push({
            customer: userId,
            rating: numericRating,
            review_text: cleanedReviewText
        })

        item.updated_at = Date.now()

        await item.save()

        const savedReview = item.reviews[
            item.reviews.length - 1
        ]

        return res.status(201).json({
            message: 'Review created successfully',
            review: savedReview
        })

    } catch (error) {
        console.error('Create review error:', error)

        return res.status(500).json({
            message: 'Error creating review'
        })
    }
}

// Get all reviews for admin
const getAllReviews = async (req, res) => {
    try {
        const items = await Item.find({
            deleted_at: null
        }).populate('reviews.customer')

        const reviews = []

        items.forEach((item) => {
            item.reviews.forEach((review) => {
                if (review.deleted_at == null) {
                    reviews.push({
                        _id: review._id,
                        item: {
                            _id: item._id,
                            item_name: item.item_name
                        },
                        customer: review.customer,
                        rating: review.rating,
                        review_text: review.review_text,
                        created_at: review.created_at,
                        updated_at: review.updated_at
                    })
                }
            })
        })

        return res.status(200).json({
            message: 'Reviews retrieved successfully',
            reviews
        })

    } catch (error) {
        console.error('Get reviews error:', error)

        return res.status(500).json({
            message: 'Error getting reviews'
        })
    }
}

// Delete review
const deleteReview = async (req, res) => {
    try {
        const item = await Item.findOne({
            'reviews._id': req.params.id
        })

        if (!item) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        const review = item.reviews.id(req.params.id)

        if (!review || review.deleted_at != null) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        review.deleted_at = new Date()
        item.updated_at = new Date()

        await item.save()

        return res.status(200).json({
            message: 'Review deleted successfully'
        })

    } catch (error) {
        console.error('Delete review error:', error)

        return res.status(500).json({
            message: 'Error deleting review'
        })
    }
}

module.exports = {
    createReview,
    getAllReviews,
    deleteReview
}
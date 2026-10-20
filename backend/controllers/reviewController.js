const Item = require('../models/itemModel')
const Order = require('../models/orderModel')

// Create review
const createReview = async (req, res) => {
    try {
        const userId = req.user.id

        const {
            item_id,
            rating,
            review_text
        } = req.body

        const item = await Item.findById(item_id)

        if (!item || item.deleted_at !== null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

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

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5'
            })
        }

        item.reviews.push({
            customer: userId,
            rating: Number(rating),
            review_text
        })

        item.updated_at = Date.now()

        await item.save()

        res.status(201).json({
            message: 'Review created successfully',
            review: item.reviews[item.reviews.length - 1]
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error creating review',
            error: error.message
        })
    }
}

// Get all reviews for admin
const getAllReviews = async (req, res) => {
    try {
        const items = await Item.find({
            deleted_at: null
        })
            .populate('reviews.customer')

        const reviews = []

        items.forEach((item) => {
            item.reviews.forEach((review) => {
                if (review.deleted_at === null) {
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

        res.status(200).json({
            message: 'Reviews retrieved successfully',
            reviews
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting reviews',
            error: error.message
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

        if (!review || review.deleted_at !== null) {
            return res.status(404).json({
                message: 'Review not found'
            })
        }

        review.deleted_at = Date.now()

        item.updated_at = Date.now()

        await item.save()

        res.status(200).json({
            message: 'Review deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error deleting review',
            error: error.message
        })
    }
}

module.exports = {
    createReview,
    getAllReviews,
    deleteReview
}

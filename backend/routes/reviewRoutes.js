
const express = require('express')

const {
    createReview,
    getMyOrderItemReview,
    updateOrderItemReview,
    getAllReviews,
    deleteReview
} = require('../controllers/reviewController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Customer: get the review for a particular order and item.
router.get(
    '/my/:itemId/orders/:orderId',
    protect,
    getMyOrderItemReview
)

// Customer: update an existing review.
router.put(
    '/my/:itemId/orders/:orderId',
    protect,
    updateOrderItemReview
)

// Customer: create a review.
router.post('/', protect, createReview)

// Admin: list and delete reviews.
// Add your existing admin authorization middleware to these
// routes if your application has role-based access control.
router.get('/', protect, getAllReviews)
router.delete('/:id', protect, deleteReview)

module.exports = router

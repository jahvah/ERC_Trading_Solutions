const express = require('express')

const {
    createReview,
    getAllReviews,
    deleteReview
} = require('../controllers/reviewController')

const {
    protect,
    admin
} = require('../middleware/authMiddleware')

const router = express.Router()

// Admin routes
router.get('/admin/all', protect, admin, getAllReviews)
router.delete('/admin/:id', protect, admin, deleteReview)

// Customer route
router.post('/', protect, createReview)

module.exports = router
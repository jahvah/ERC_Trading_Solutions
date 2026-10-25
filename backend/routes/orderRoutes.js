
const express = require('express')

const {
    createOrder,
    getOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController')

const {
    protect
} = require('../middleware/authMiddleware')

const router = express.Router()

// Admin routes
// Note: protect verifies login, but admin authorization
// should also be checked inside these routes.
router.get('/admin/all', protect, getAllOrders)
router.put('/admin/:id', protect, updateOrderStatus)

// Customer routes
// Checkout selected items or the entire cart
router.post('/', protect, createOrder)

// Get orders belonging to the logged-in customer
router.get('/', protect, getOrders)

// Get a specific order belonging to the logged-in customer
router.get('/:id', protect, getOrder)

module.exports = router

const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')

// Create order from cart
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id

        const cart = await Cart.findOne({
            user: userId
        }).populate('items.item')

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: 'Cart is empty'
            })
        }

        const orderLines = cart.items.map((cartItem) => ({
            item: cartItem.item._id,
            quantity: cartItem.quantity,
            price: cartItem.item.sell_price
        }))

        const order = await Order.create({
            customer: userId,
            order_lines: orderLines,
            status: 'Pending'
        })

        cart.items = []
        cart.updated_at = Date.now()

        await cart.save()

        const createdOrder = await Order.findById(order._id)
            .populate('customer')
            .populate('order_lines.item')

        res.status(201).json({
            message: 'Order created successfully',
            order: createdOrder
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error creating order',
            error: error.message
        })
    }
}

// Get user's orders
const getOrders = async (req, res) => {
    try {
        const userId = req.user.id

        const orders = await Order.find({
            customer: userId,
            deleted_at: null
        })
            .populate('order_lines.item')
            .sort({ date_placed: -1 })

        res.status(200).json({
            message: 'Orders retrieved successfully',
            orders
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting orders',
            error: error.message
        })
    }
}

// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('order_lines.item')

        if (!order || order.deleted_at !== null) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        if (order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Not authorized to view this order'
            })
        }

        res.status(200).json({
            message: 'Order retrieved successfully',
            order
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting order',
            error: error.message
        })
    }   
}

// Get all orders for admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            deleted_at: null
        })
            .populate('customer')
            .populate('order_lines.item')
            .sort({ date_placed: -1 })

        res.status(200).json({
            message: 'All orders retrieved successfully',
            orders
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting all orders',
            error: error.message
        })
    }
}

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)

        if (!order || order.deleted_at !== null) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        const { status } = req.body

        const validStatuses = [
            'Pending',
            'Shipped',
            'Delivered',
            'Cancelled'
        ]

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid order status'
            })
        }

        order.status = status

        if (status === 'Shipped') {
            order.date_shipped = Date.now()
        }

        if (status === 'Delivered') {
            order.date_delivered = Date.now()
        }

        order.updated_at = Date.now()

        await order.save()

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        })
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    getAllOrders,
    updateOrderStatus
}
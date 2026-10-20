const Item = require('../models/itemModel')

// Create item
const createItem = async (req, res) => {
    try {
        const {
            item_name,
            description,
            cost_price,
            sell_price,
            category,
            images,
            stock
        } = req.body

        const item = await Item.create({
            item_name,
            description,
            cost_price,
            sell_price,
            category,
            images: images || [],
            stock: stock || {}
        })

        res.status(201).json({
            message: 'Item created successfully',
            item
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error creating item',
            error: error.message
        })
    }
}

// Get all items
const getItems = async (req, res) => {
    try {
        const items = await Item.find({
            deleted_at: null
        })

        res.status(200).json({
            message: 'Items retrieved successfully',
            items
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting items',
            error: error.message
        })
    }
}

// Get single item
const getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)

        if (!item || item.deleted_at !== null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        res.status(200).json({
            message: 'Item retrieved successfully',
            item
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting item',
            error: error.message
        })
    }
}

// Update item
const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)

        if (!item || item.deleted_at !== null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        const {
            item_name,
            description,
            cost_price,
            sell_price,
            category,
            images,
            stock
        } = req.body

        item.item_name = item_name ?? item.item_name
        item.description = description ?? item.description
        item.cost_price = cost_price ?? item.cost_price
        item.sell_price = sell_price ?? item.sell_price
        item.category = category ?? item.category
        item.images = images ?? item.images
        item.stock = stock ?? item.stock
        item.updated_at = Date.now()

        await item.save()

        res.status(200).json({
            message: 'Item updated successfully',
            item
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error updating item',
            error: error.message
        })
    }
}

// Delete item
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)

        if (!item || item.deleted_at !== null) {
            return res.status(404).json({
                message: 'Item not found'
            })
        }

        item.deleted_at = Date.now()

        await item.save()

        res.status(200).json({
            message: 'Item deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error deleting item',
            error: error.message
        })
    }
}

module.exports = {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem
}
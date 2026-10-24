
const express = require('express')

const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    bulkDeleteItems
} = require('../controllers/itemController')

const { protect, admin } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

// Public product browsing
router.get('/', getItems)
router.get('/:id', getItem)

// Admin-only product management
router.post('/', protect, admin, upload.array('images', 10), createItem)
router.put('/:id', protect, admin, upload.array('images', 10), updateItem)
router.delete('/bulk', protect, admin, bulkDeleteItems)
router.delete('/:id', protect, admin, deleteItem)

module.exports = router

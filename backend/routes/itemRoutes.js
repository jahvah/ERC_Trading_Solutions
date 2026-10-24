
const express = require('express');

const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,
    getDeletedItems,
    restoreItem
} = require('../controllers/itemController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public product browsing
router.get('/', getItems);

// Admin-only: get deleted products
// Keep this BEFORE router.get('/:id', getItem)
router.get('/deleted', protect, admin, getDeletedItems);

// Admin-only: bulk delete products
// Keep this BEFORE router.delete('/:id', deleteItem)
router.delete('/bulk', protect, admin, bulkDeleteItems);

// Restore a deleted product
router.patch('/:id/restore', protect, admin, restoreItem);

// Get one product
router.get('/:id', getItem);

// Admin-only product management
router.post('/', protect, admin, upload.array('images', 10), createItem);
router.put('/:id', protect, admin, upload.array('images', 10), updateItem);
router.delete('/:id', protect, admin, deleteItem);

module.exports = router;

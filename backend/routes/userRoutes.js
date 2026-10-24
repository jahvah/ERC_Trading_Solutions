
const express = require('express')

const {
    registerUser,
    completeRegistration,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    getMyProfile,
    updateMyProfile
} = require('../controllers/userController')

const { protect, admin } = require('../middleware/authMiddleware')
const profileUpload = require('../middleware/profileUpload')

const router = express.Router()

// Registration
router.post('/register', registerUser)

router.post(
    '/complete-registration',
    profileUpload.single('profile_image'),
    completeRegistration
)

// Login
router.post('/login', loginUser)

// My Profile
router.get('/profile', protect, getMyProfile)
router.put('/profile', protect, updateMyProfile)

// User Management — Admin Only
router.get('/', protect, admin, getUsers)
router.get('/:id', protect, admin, getUser)
router.put('/:id', protect, admin, updateUser)
router.delete('/:id', protect, admin, deleteUser)

// Activate or Deactivate a User Account — Admin Only
router.patch('/:id/status', protect, admin, updateUserStatus)

module.exports = router

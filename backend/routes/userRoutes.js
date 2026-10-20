const express = require('express')

const {
    registerUser,
    completeRegistration,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/userController')

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

// User management
router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router

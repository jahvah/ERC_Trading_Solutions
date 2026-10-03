const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register user
const registerUser = async (req, res) => {
    try {
        const {
            email,
            password,
            role,
            profile_image,
            customer
        } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'User',
            profile_image: profile_image || null,
            customer: customer || {}
        })

        res.status(201).json({
            message: 'User registered successfully',
            user
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        })
    }
}

// Login user
const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body

        // Check if user exists
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        // Save token
        user.token = token
        await user.save()

        res.status(200).json({
            message: 'Login successful',
            token,
            user
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        })
    }
}

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find()

        res.status(200).json({
            users
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting users',
            error: error.message
        })
    }
}

// Get single user
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            user
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error getting user',
            error: error.message
        })
    }
}

// Update user
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        user.email = req.body.email || user.email
        user.profile_image = req.body.profile_image || user.profile_image
        user.role = req.body.role || user.role
        user.status = req.body.status || user.status

        if (req.body.customer) {
            user.customer = {
                ...user.customer.toObject(),
                ...req.body.customer
            }
        }

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10)
        }

        const updatedUser = await user.save()

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error updating user',
            error: error.message
        })
    }
}

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        user.deleted_at = new Date()
        user.status = 'Deactivated'

        await user.save()

        res.status(200).json({
            message: 'User deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error deleting user',
            error: error.message
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
}
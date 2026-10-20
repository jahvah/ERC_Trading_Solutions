const User = require('../models/userModel')
const TemporaryRegistration = require('../models/temporaryRegistrationModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const validator = require('validator')


// Register user

const registerUser = async (req, res) => {
    try {
        const email = String(req.body.email || '')
            .trim()
            .toLowerCase()

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(409).json({
                message: 'This email address is already registered. Please log in or use another email address.'
            })
        }

        let registrationToken = req.body.registrationToken
        let temporaryRegistration =
            await TemporaryRegistration.findOne({ email })

        if (temporaryRegistration) {
            if (
                temporaryRegistration.expires_at <= new Date()
            ) {
                await TemporaryRegistration.deleteOne({
                    _id: temporaryRegistration._id
                })

                temporaryRegistration = null
            }
        }

        if (temporaryRegistration) {
            if (
                !registrationToken ||
                typeof registrationToken !== 'string'
            ) {
                return res.status(409).json({
                    message: 'A registration is already in progress. Continue using the browser where you started it.'
                })
            }

            const submittedHash = crypto
                .createHash('sha256')
                .update(registrationToken)
                .digest('hex')

            if (
                submittedHash !==
                temporaryRegistration.registration_token_hash
            ) {
                return res.status(403).json({
                    message: 'Unable to resume this registration in this browser.'
                })
            }

            temporaryRegistration.expires_at = new Date(
                Date.now() + 30 * 60 * 1000
            )
            temporaryRegistration.updated_at = new Date()

            await temporaryRegistration.save()

            return res.status(200).json({
                message: 'Registration resumed successfully',
                registrationToken
            })
        }

        registrationToken = crypto
            .randomBytes(32)
            .toString('hex')

        const registrationTokenHash = crypto
            .createHash('sha256')
            .update(registrationToken)
            .digest('hex')

        try {
            await TemporaryRegistration.create({
                email,
                registration_token_hash: registrationTokenHash,
                expires_at: new Date(Date.now() + 30 * 60 * 1000)
            })
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'A registration is already in progress. Please continue the existing registration.'
                })
            }

            throw error
        }

        res.status(201).json({
            message: 'Email accepted. Please complete your information.',
            registrationToken
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error starting registration',
            error: error.message
        })
    }
}

const completeRegistration = async (req, res) => {
    try {
        const {
            registrationToken,
            fname,
            lname,
            username,
            phone,
            gender,
            date_of_birth,
            password,
            confirmPassword
        } = req.body

        if (
            !registrationToken ||
            typeof registrationToken !== 'string'
        ) {
            return res.status(400).json({
                message: 'Please restart registration and try again.'
            })
        }

        const registrationTokenHash = crypto
            .createHash('sha256')
            .update(registrationToken)
            .digest('hex')

        const temporaryRegistration =
            await TemporaryRegistration.findOne({
                registration_token_hash: registrationTokenHash
            })

        if (!temporaryRegistration) {
            return res.status(400).json({
                message: 'Registration expired or invalid. Please start again.'
            })
        }

        if (temporaryRegistration.expires_at <= new Date()) {
            await TemporaryRegistration.deleteOne({
                _id: temporaryRegistration._id
            })

            return res.status(400).json({
                message: 'Registration expired. Please start again.'
            })
        }

        const cleanFname = String(fname || '').trim()
        const cleanLname = String(lname || '').trim()
        const cleanUsername = String(username || '')
            .trim()
            .toLowerCase()
        const cleanPhone = String(phone || '').trim()

        if (
            !cleanFname ||
            !cleanLname ||
            !cleanUsername ||
            !cleanPhone ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: 'Please complete all required fields.'
            })
        }

        if (cleanFname.length > 100 || cleanLname.length > 100) {
            return res.status(400).json({
                message: 'First name and last name cannot exceed 100 characters.'
            })
        }

        if (
            !validator.isLength(cleanUsername, {
                min: 3,
                max: 30
            }) ||
            !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)
        ) {
            return res.status(400).json({
                message: 'Username must be 3–30 characters and may contain letters, numbers, dots, underscores, and hyphens.'
            })
        }

        if (cleanPhone.length > 30) {
            return res.status(400).json({
                message: 'Please enter a valid contact number.'
            })
        }

        if (
            typeof password !== 'string' ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Password and confirm password do not match.'
            })
        }

        if (
            gender &&
            !['Male', 'Female', 'Other', 'Prefer not to say']
                .includes(gender)
        ) {
            return res.status(400).json({
                message: 'Please select a valid gender.'
            })
        }

        let parsedDateOfBirth = null

        if (date_of_birth) {
            if (
                typeof date_of_birth !== 'string' ||
                !validator.isISO8601(date_of_birth, {
                    strict: true
                })
            ) {
                return res.status(400).json({
                    message: 'Please enter a valid date of birth.'
                })
            }

            parsedDateOfBirth = new Date(date_of_birth)

            if (parsedDateOfBirth >= new Date()) {
                return res.status(400).json({
                    message: 'Date of birth must be in the past.'
                })
            }
        }

        const existingEmail = await User.findOne({
            email: temporaryRegistration.email
        })

        if (existingEmail) {
            return res.status(409).json({
                message: 'This email address is already registered. Please log in or use another email address.'
            })
        }

        const existingUsername = await User.findOne({
            username: cleanUsername
        })

        if (existingUsername) {
            return res.status(409).json({
                message: 'This username is already taken. Please choose another username.'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        let user

        try {

user = await User.create({
    email: temporaryRegistration.email,
    username: cleanUsername,
    password: hashedPassword,

    role: 'User',
    status: 'Active',
    registration_completed: true,

    profile_image: req.file ? req.file.filename : null,

    customer: {
        fname: cleanFname,
        lname: cleanLname,
        phone: cleanPhone,
        gender: gender || null,
        date_of_birth: parsedDateOfBirth
    }
})

        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'This email or username is already registered. Please use different details.'
                })
            }

            throw error
        }

        await TemporaryRegistration.deleteOne({
            _id: temporaryRegistration._id
        })

        res.status(201).json({
            message: 'Registration successful! Please log in.',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                customer: user.customer
            }
        })

    } catch (error) {
        res.status(500).json({
            message: 'Error completing registration',
            error: error.message
        })
    }
}

// Login user

const loginUser = async (req, res) => {
    try {
        const email = String(req.body.email || '')
            .trim()
            .toLowerCase()

        const { password } = req.body

        if (!validator.isEmail(email) || !password) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        if (
            user.registration_completed === false ||
            !user.username ||
            !user.customer?.fname ||
            !user.customer?.lname ||
            !user.customer?.phone
        ) {
            return res.status(403).json({
                message: 'Please complete your registration before logging in.'
            })
        }

        if (user.deleted_at || user.status !== 'Active') {
            return res.status(403).json({
                message: 'This account is not active.'
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

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

        user.token = token
        user.updated_at = new Date()
        await user.save()

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
                profile_image: user.profile_image,
                customer: user.customer
            }
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
    completeRegistration,
    loginUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
}
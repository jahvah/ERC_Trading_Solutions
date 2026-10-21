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
            title,
            fname,
            lname,
            username,
            phone,
            gender,
            date_of_birth,
            addressline,
            town,
            password,
            confirmPassword
        } = req.body;

        // Validate registration token
        if (
            !registrationToken ||
            typeof registrationToken !== 'string'
        ) {
            return res.status(400).json({
                message: 'Please restart registration and try again.'
            });
        }

        const registrationTokenHash = crypto
            .createHash('sha256')
            .update(registrationToken)
            .digest('hex');

        const temporaryRegistration =
            await TemporaryRegistration.findOne({
                registration_token_hash: registrationTokenHash
            });

        if (!temporaryRegistration) {
            return res.status(400).json({
                message: 'Registration expired or invalid. Please start again.'
            });
        }

        if (temporaryRegistration.expires_at <= new Date()) {
            await TemporaryRegistration.deleteOne({
                _id: temporaryRegistration._id
            });

            return res.status(400).json({
                message: 'Registration expired. Please start again.'
            });
        }

        // Clean up submitted text fields
        const cleanTitle = String(title || '').trim();
        const cleanFname = String(fname || '').trim();
        const cleanLname = String(lname || '').trim();
        const cleanUsername = String(username || '')
            .trim()
            .toLowerCase();
        const cleanPhone = String(phone || '').trim();
        const cleanGender = String(gender || '').trim();
        const cleanAddressline = String(addressline || '').trim();
        const cleanTown = String(town || '').trim();

        // Required fields
        if (
            !cleanTitle ||
            !cleanFname ||
            !cleanLname ||
            !cleanUsername ||
            !cleanPhone ||
            !cleanGender ||
            !date_of_birth ||
            !cleanAddressline ||
            !cleanTown ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: 'Please complete all required fields.'
            });
        }

        // Validate title
        if (!['Mr.', 'Ms.', 'Mrs.', 'Dr.'].includes(cleanTitle)) {
            return res.status(400).json({
                message: 'Please select a valid title.'
            });
        }

        // Validate names
        if (
            cleanFname.length > 100 ||
            cleanLname.length > 100
        ) {
            return res.status(400).json({
                message: 'First name and last name cannot exceed 100 characters.'
            });
        }

        // Validate username
        if (
            !validator.isLength(cleanUsername, {
                min: 3,
                max: 30
            }) ||
            !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)
        ) {
            return res.status(400).json({
                message: 'Username must be 3–30 characters and may contain letters, numbers, dots, underscores, and hyphens.'
            });
        }

        // Validate phone
        if (cleanPhone.length > 30) {
            return res.status(400).json({
                message: 'Contact number cannot exceed 30 characters.'
            });
        }

        // Validate address and town
        if (
            cleanAddressline.length > 200 ||
            cleanTown.length > 200
        ) {
            return res.status(400).json({
                message: 'Address line and town cannot exceed 200 characters.'
            });
        }

        // Validate password
        if (
            typeof password !== 'string' ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Password and confirm password do not match.'
            });
        }

        // Validate gender
        if (
            !['Male', 'Female', 'Other', 'Prefer not to say']
                .includes(cleanGender)
        ) {
            return res.status(400).json({
                message: 'Please select a valid gender.'
            });
        }

        // Validate date of birth
        let parsedDateOfBirth;

        if (
            typeof date_of_birth !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)
        ) {
            return res.status(400).json({
                message: 'Please enter a valid date of birth.'
            });
        }

        parsedDateOfBirth = new Date(`${date_of_birth}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDateOfBirth.getTime()) ||
            parsedDateOfBirth.toISOString().slice(0, 10) !== date_of_birth
        ) {
            return res.status(400).json({
                message: 'Please enter a valid date of birth.'
            });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (parsedDateOfBirth >= today) {
            return res.status(400).json({
                message: 'Date of birth must be before today.'
            });
        }

        // Check for an existing email
        const existingEmail = await User.findOne({
            email: temporaryRegistration.email
        });

        if (existingEmail) {
            return res.status(409).json({
                message: 'This email address is already registered. Please log in or use another email address.'
            });
        }

        // Check for an existing username
        const existingUsername = await User.findOne({
            username: cleanUsername
        });

        if (existingUsername) {
            return res.status(409).json({
                message: 'This username is already taken. Please choose another username.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;

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
                    title: cleanTitle,
                    fname: cleanFname,
                    lname: cleanLname,
                    phone: cleanPhone,
                    gender: cleanGender,
                    date_of_birth: parsedDateOfBirth,
                    addressline: cleanAddressline,
                    town: cleanTown
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: 'This email or username is already registered. Please use different details.'
                });
            }

            throw error;
        }

        // Delete temporary registration after successful account creation
        await TemporaryRegistration.deleteOne({
            _id: temporaryRegistration._id
        });

        return res.status(201).json({
            message: 'Registration successful! Please log in.',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                customer: user.customer
            }
        });

    } catch (error) {
        console.error('Complete registration error:', error);

        return res.status(500).json({
            message: 'Error completing registration',
            error: error.message
        });
    }
};

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


const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -token -remember_token')

        if (!user || user.deleted_at || user.status !== 'Active') {
            return res.status(404).json({
                message: 'Profile not found or account is inactive.'
            })
        }

        res.status(200).json({
            user
        })
    } catch (error) {
        console.error('Get my profile error:', error)

        res.status(500).json({
            message: 'Failed to load profile.'
        })
    }
}

const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        if (!user || user.deleted_at || user.status !== 'Active') {
            return res.status(404).json({
                message: 'Profile not found or account is inactive.'
            })
        }

        const allowedFields = [
            'fname',
            'lname',
            'phone',
            'gender',
            'date_of_birth',
            'addressline',
            'town',
            'title'
        ]

        const submittedFields = Object.keys(req.body || {})
        const invalidFields = submittedFields.filter(
            field => !allowedFields.includes(field)
        )

        if (invalidFields.length > 0) {
            return res.status(400).json({
                message: `These fields cannot be updated through the profile: ${invalidFields.join(', ')}`
            })
        }

        const customer = user.customer || {}

        for (const field of allowedFields) {
            if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
                continue
            }

            const value = req.body[field]

            if (field === 'gender') {
                const allowedGenders = [
                    'Male',
                    'Female',
                    'Other',
                    'Prefer not to say'
                ]

                if (
                    value !== null &&
                    value !== '' &&
                    !allowedGenders.includes(value)
                ) {
                    return res.status(400).json({
                        message: 'Please select a valid gender.'
                    })
                }

                customer.gender = value || null
                continue
            }

            if (field === 'date_of_birth') {
                if (value === null || value === '') {
                    customer.date_of_birth = null
                    continue
                }

                if (
                    typeof value !== 'string' ||
                    !/^\d{4}-\d{2}-\d{2}$/.test(value)
                ) {
                    return res.status(400).json({
                        message: 'Please enter a valid date of birth.'
                    })
                }

                const date = new Date(`${value}T00:00:00.000Z`)

                if (
                    Number.isNaN(date.getTime()) ||
                    date.toISOString().slice(0, 10) !== value ||
                    date >= new Date()
                ) {
                    return res.status(400).json({
                        message: 'Date of birth must be a valid date in the past.'
                    })
                }

                customer.date_of_birth = date
                continue
            }

            if (value !== null && typeof value !== 'string') {
                return res.status(400).json({
                    message: `${field} must be text.`
                })
            }

            const cleanValue = value === null ? '' : value.trim()

            if (['fname', 'lname'].includes(field)) {
                if (!cleanValue) {
                    return res.status(400).json({
                        message: `${field === 'fname' ? 'First name' : 'Last name'} is required.`
                    })
                }

                if (cleanValue.length > 100) {
                    return res.status(400).json({
                        message: 'First name and last name cannot exceed 100 characters.'
                    })
                }
            }

            if (field === 'phone' && cleanValue.length > 30) {
                return res.status(400).json({
                    message: 'Contact number cannot exceed 30 characters.'
                })
            }

            if (
                ['addressline', 'town', 'title'].includes(field) &&
                cleanValue.length > 200
            ) {
                return res.status(400).json({
                    message: `${field} cannot exceed 200 characters.`
                })
            }

            customer[field] = cleanValue || null
        }

        user.customer = customer
        user.updated_at = new Date()

        await user.save()

        const safeUser = await User.findById(user._id)
            .select('-password -token -remember_token')

        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: safeUser
        })
    } catch (error) {
        console.error('Update my profile error:', error)

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Some profile information is invalid.'
            })
        }

        res.status(500).json({
            message: 'Failed to update profile. Please try again.'
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
    deleteUser,
    getMyProfile,
    updateMyProfile
}

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter user email'],
        unique: true,
        trim: true
    },

    email_verified_at: {
        type: Date,
        default: null
    },

    password: {
        type: String,
        required: [true, 'Please enter user password']
    },

    remember_token: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: {
            values: ['User', 'Admin'],
            message: 'Please select correct user role'
        },
        default: 'User'
    },

    profile_image: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: {
            values: ['Active', 'Deactivated'],
            message: 'Please select correct user status'
        },
        default: 'Active'
    },

    token: {
        type: String,
        default: null
    },

    customer: {
        title: {
            type: String,
            default: null
        },

        fname: {
            type: String,
            default: null,
            trim: true
        },

        lname: {
            type: String,
            default: null,
            trim: true
        },

        addressline: {
            type: String,
            default: null
        },

        town: {
            type: String,
            default: null
        },

        phone: {
            type: String,
            default: null
        },

        image_path: {
            type: String,
            default: null
        }
    },

    deleted_at: {
        type: Date,
        default: null
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)
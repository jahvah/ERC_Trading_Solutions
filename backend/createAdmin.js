const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const User = require('./models/userModel')

dotenv.config()

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        const existingAdmin = await User.findOne({
            email: 'admin@example.com'
        })

        if (existingAdmin) {
            console.log('Admin already exists')
            process.exit()
        }

        const hashedPassword = await bcrypt.hash(
            'admin123',
            10
        )

        const admin = await User.create({
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'Admin',
            status: 'Active',
            customer: {
                fname: 'Admin',
                lname: 'User'
            }
        })

        console.log('Admin created successfully')
        console.log(admin)

        process.exit()

    } catch (error) {
        console.error('Error creating admin:', error.message)
        process.exit(1)
    }
}

createAdmin()
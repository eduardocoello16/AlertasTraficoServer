const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        username: {
            type: String,
            require: false
        },
        first_name: {
            type: String,
            require: false
        },
        last_name: {
            type: String,
            require: false
        },
        typeUser: {
            type: String,
            enum: ['admin','moder', 'user'],
            default: 'user'
        },
        statusUser: {
            type: String,
            enum: ['pending','active', 'banned'],
            default: 'pending'
        },
        penalization: {
            type: Number,
            default: 0
        },
        DateCreation: {
            type: Date,
            default: Date.now
        }
    }
)

module.exports = mongoose.model('user', userSchema)
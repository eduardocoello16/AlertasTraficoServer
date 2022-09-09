const mongoose = require('mongoose');


const botinfoSchema = mongoose.Schema(
    { id: {
        type: String,
        require: true
    },
       name:{
        type: String
       },
       obtenerTweets: {
        type: Boolean
       },
        usuariosPublicaciones: {
            type: Boolean
        },

    whiteList: {
        type: Array
    },
    blackList: {
        type: Array
    },
    blackListGroup: {
        type: Array
    }
    })

    module.exports = mongoose.model('botinfo', botinfoSchema)

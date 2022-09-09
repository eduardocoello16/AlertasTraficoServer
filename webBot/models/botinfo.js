const mongoose = require('mongoose');
const { addBlackListGroup } = require('../../accionesBot/Filtro');

const botinfoSchema = mongoose.Schema(
    { 
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

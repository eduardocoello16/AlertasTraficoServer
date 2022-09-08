const mongoose = require('mongoose');
const { addBlackListGroup } = require('../../accionesBot/Filtro');

const userSchema = mongoose.Schema(
    { 
        name: {
            type: String,
            default: 'FiltroTweets'
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
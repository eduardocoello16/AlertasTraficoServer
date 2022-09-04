const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers)
const grupoAdmins = process.env.BOT_AdminGroup
const grupoAlertas = process.env.BOT_GroupToSend
const canalAlertas = process.env.BOT_ChannelToSend
//Bot
const {
    Telegraf
} = require('telegraf')
const botToken = process.env.BOT_TOKEN
const bot = new Telegraf(botToken)

module.exports = {
    usuariosAdmin,
    grupoAdmins,
    grupoAlertas,
    canalAlertas,
    botToken,
    bot
  };
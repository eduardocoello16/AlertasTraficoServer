const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers)
const grupoAdmins = process.env.BOT_AdminGroup_Test
const grupoAlertas = process.env.BOT_GroupToSend_Test
const canalAlertas = process.env.BOT_ChannelToSend_Test
//Bot
const {
    Telegraf
} = require('telegraf')
const botToken = process.env.BOT_TOKEN_Test
const bot = new Telegraf(botToken, 
    {
        telegram: {
           testEnv: true
        } 
        })

module.exports = {
    usuariosAdmin,
    grupoAdmins,
    grupoAlertas,
    canalAlertas,
    bot
  };
  //dsffsd
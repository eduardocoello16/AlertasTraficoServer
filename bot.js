const { Telegraf } = require('telegraf')
require('dotenv').config({path: './.env'});
const  twitter  = require('./twitter')
//Variables usuarios
const usuarioAdmin = JSON.parse(process.env.BOT_AdminUsers)[0]

//Creando el bot
const bot = new Telegraf(process.env.BOT_TOKEN_Beta)

//Comandos del bot
bot.start((ctx) => {
    //Get group id
    var id = ctx.update.message.chat;
    console.log(id)
    ctx.reply('Welcome')
    
    
}
)

//Start bot
try {
    bot.launch()
    console.log('Bot Iniciado correctamente')
    //Obtener todos los tweets
    var users = JSON.parse(process.env.Twitter_Accounts);
    users.forEach(user => {
        obtenerTweets(user.id, user.name)
    });
    
} catch (error) {
    console.log(error)
}

async function obtenerTweets(id, name) {
    let tweet = await twitter.obtenerTwett(id)
    //Send message without url preview
    bot.telegram.sendMessage(process.env.BOT_ChannelToSend,`${tweet.text}\n${name}`,{ disable_web_page_preview: true })
    
}


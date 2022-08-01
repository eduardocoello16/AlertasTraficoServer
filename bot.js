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
   obtenerTweets()
    
} catch (error) {
    console.log(error)
}



function obtenerTweets(){
    var users = JSON.parse(process.env.Twitter_Accounts);
    users.forEach(user => {
        obtenerTweet(user.id, user.name)
    });

setTimeout(function(){
    console.log("I am the third log after 10 seconds");
    obtenerTweets()
},10000);
}
async function obtenerTweet(id, name) {
    let tweet = await twitter.getTwett(id)
    //Comprobar si el tweet ya se ha enviado anteriormente
    if(comprobarEnviado() === false){
        //Filtrar Tweet
        //Send message without url preview
    bot.telegram.sendMessage(process.env.BOT_ChannelToSend,`${tweet.text}\n${name}`,{disable_web_page_preview: true})
    //Mensaje sin sonido = disable_notification: true
    }else{
        //Guardar en .log fecha y hora del tweet
        console.log(`[Mensaje ya envíado]\nId Tweet: ${tweet.id}\nUsuario: ${name}`+ `\n${new Date()}`) 
    }
    
    function comprobarEnviado(){
        //Comprobar un registro si el tweet se ha enviado
        var log = JSON.parse(process.env.BOT_Log)
        var encontrado = false
        log.forEach(element => {
            if(element.id === tweet.id){
                encontrado = true
            }
        }
        )
        //Si no se ha encontrado el tweet en el log, se añade al log
        if(encontrado === false){
            log.push({id: tweet.id})
            //Guardar en .log fecha y hora del tweet
            console.log(`[Mensaje enviado]\nId Tweet: ${tweet.id}\nUsuario: ${name}`+ `\n${new Date()}`)
            //Guardar en .log el log
            fs.writeFileSync('./.env', JSON.stringify({BOT_Log: log}))
            return false
        }else{
            return true
        }
       
    
    }
   
}


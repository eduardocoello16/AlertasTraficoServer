const { Telegraf } = require('telegraf')
require('dotenv').config({path: './.env'});
const fs = require('fs');
const axios = require('axios').default;
const  twitter  = require('./twitter')
//Variables usuarios
const usuarioAdmin = JSON.parse(process.env.BOT_AdminUsers)[0]

//Creando el bot
const bot = new Telegraf(process.env.BOT_TOKEN_Beta)
//Comprobar si el archivo bot.log existe, si no crearlo
if(fs.existsSync('./bot.log') === false){
    fs.writeFileSync('./bot.log', 'Registro de tweets enviados al canal\n')
    
}


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
    console.log('Comprobación de tweets nuevos')
    var users = JSON.parse(process.env.Twitter_Accounts);
    users.forEach(user => {
        obtenerTweet(user.id, user.name)
    });

setTimeout(function(){
    console.log("I am the third log after 10 seconds");
    obtenerTweets()
},300000);
}
async function obtenerTweet(id, name) {
    var tweet = await twitter.getTwett(id)
    //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
    if(comprobarLog() === false){
        //Filtrar Tweet
        if( filtradoWhiteList(tweet) === true){
            if(filtradoBlackList(tweet) === true){
                      //Enviar tweet al grupo
                      bot.telegram.sendMessage(process.env.BOT_GroupToSend,`${tweet.text}\n${name}`,
                      //Send message without url preview
                      {disable_web_page_preview: true})
                      //Mensaje sin sonido = disable_notification: true
                
            }else{
                    //Enviar tweet al canal
                    bot.telegram.sendMessage(process.env.BOT_ChannelToSend,`${tweet.text}\n${name}`,
                    //Send message without url preview
                    {disable_web_page_preview: true})
                    //Mensaje sin sonido = disable_notification: true
            }
           
        }
        
    }else{
        //Guardar en .log fecha y hora del tweet
        console.log(`[Mensaje rechazado - Ya envíado]\nId Tweet: ${tweet.id}\nUsuario: ${name}`+ `\n${new Date()}`) 
    }
    
    function comprobarLog(){
        
        //Comprobar un registro .log si el tweet se ha enviado
        var log = fs.readFileSync('./bot.log', 'utf8')
        if(log.includes(tweet.id)){
            return true
        }else{
            //Añade el id del  tweet al .log
            fs.appendFileSync('./bot.log', `Id Tweet: ${tweet.id}\nUsuario: ${name}`+ `\n${new Date()}\n`)
            return false
        }
       
        
    
    }
   
}

 function filtradoWhiteList(tweet){
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.whiteList;
    let tweetText = tweet.text;
    whiteList.forEach(element => {
        if(tweetText.includes(element)){
       
            salida = true
        }
    })
    return salida
}
function filtradoBlackList(tweet){
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.blackList;
    let tweetText = tweet.text;
    whiteList.forEach(element => {
        if(tweetText.includes(element)){
       
            salida = true
        }
    })
    return salida
}
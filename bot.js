const { Telegraf } = require('telegraf')
require('dotenv').config({path: './.env'});
const fs = require('fs');
const axios = require('axios').default;
const  twitter  = require('./twitter')
//Variables usuarios
const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers)

//Creando el bot
const bot = new Telegraf(process.env.BOT_TOKEN_Beta)
//Comprobar si el archivo bot.log existe, si no crearlo
if(fs.existsSync('./bot.log') === false){
    fs.writeFileSync('./bot.log', 'Registro de tweets enviados al canal\n')
    
}
//Cambiar permisos un usuario a administrador y hacerlo anónimo
bot.command('modoOculto', async (ctx) => {
    
    let id = ctx.message.from.id
    //Comprobar que un usuario es anonimo
    let user = await bot.telegram.getChatMember(process.env.BOT_GroupToSend, id)

    console.log(user.can_change_info)
    try {
        if(user.is_anonymous === true){
        await bot.telegram.promoteChatMember(process.env.BOT_GroupToSend, id, {is_anonymous: false, can_change_info: user.can_change_info, can_delete_messages: user.can_delete_messages, can_invite_users: user.can_invite_users, can_restrict_members: user.can_restrict_members, can_pin_messages: user.can_pin_messages, can_promote_members: user.can_promote_members})
        ctx.reply('Modo oculto desactivado')
    }else{
        await bot.telegram.promoteChatMember(process.env.BOT_GroupToSend, id, {is_anonymous: true, can_change_info: user.can_change_info, can_delete_messages: user.can_delete_messages, can_invite_users: user.can_invite_users, can_restrict_members: user.can_restrict_members, can_pin_messages: user.can_pin_messages, can_promote_members: user.can_promote_members})
        ctx.reply('Modo oculto activado')
    }
        
        
    } catch (error) {
        ctx.reply('Ha ocurrido un error al cambiar el modo oculto. ¿Eres un administrador asignado por el bot?')
    }

})

//Hacer un usuario administrador
bot.command('setAdmin', async (ctx) => {
    let id = ctx.message.from.id
    if(comprobarAdmin(ctx) === true){
        console.log(ctx.message.text)
        //Obtener usuario a añadir a la lista de administradores
        let user = ctx.message.text.split(' ')[1]
        console.log(user)
        //Añadir usuario a la lista de administradores
       try {
        await bot.telegram.promoteChatMember(process.env.BOT_GroupToSend, user, { can_change_info: true, can_delete_messages: true,can_manage_chat: true ,can_invite_users: true, can_restrict_members: true, can_pin_messages: true, can_manage_video_chats: true, can_promote_members: true}) 
        ctx.reply(`Se han actualizado los permisos del usuario ${user}`)
       } catch (error) {
        console.log(error)
        ctx.reply('Error al añadir usuario')
       }
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }

} )

//Quitar un usuario administrador
bot.command('quitAdmin', async (ctx) => {
    let id = ctx.message.from.id
    if(comprobarAdmin(ctx) === true){
        console.log(ctx.message.text)
        //Obtener usuario a añadir a la lista de administradores
        let user = ctx.message.text.split(' ')[1]
        console.log(user)
        //Añadir usuario a la lista de administradores
       try {
        await bot.telegram.promoteChatMember(process.env.BOT_GroupToSend, user, { }) 
        ctx.reply(`Se han actualizado los permisos del usuario ${user}`)
       } catch (error) {
        console.log(error)
        ctx.reply('Error al añadir usuario')
       }
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }

} )






bot.command('getId' , async (ctx) => {
let id;
if(ctx.update.message.chat.type === 'private'){
id = ctx.message.from.id
}else{
     id = ctx.update.message.from.id
}
ctx.reply(id)
} )


bot.start((ctx) => {
    //Get group id
    var id = ctx.update.message.chat;
    console.log(id)
    ctx.reply('Welcome')
}
)
//Comando /getBlackList -> Obtiene la BlackList del JSON 
bot.command('getBlackList', (ctx) => {
    if(comprobarAdmin(ctx) === true){
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let blackList = result.blackList;
    ctx.reply(`BlackList:\n${blackList}`)
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }

}
)
//Comando /getBlackListGroup -> Obtiene la BlackListGroup del JSON 
bot.command('getBlackListGroup', (ctx) => {
    if(comprobarAdmin(ctx) === true){
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let blackList = result.blackListGroup;
    ctx.reply(`BlackList para filtrar en el grupo:\n${blackList}`)
    }
    else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
    
}
)

//Comando /getWhiteList -> Obtiene la WhiteList del JSON 
bot.command('getWhiteList', (ctx) => {
    //Comprobar el usuario es admin
    if(comprobarAdmin(ctx) === true){

    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.whiteList;
    ctx.reply(`WhiteList:\n${whiteList}`)
}
else{
    ctx.reply('No tienes permisos para ejecutar este comando')
}
    
}
)

//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ')
bot.launch().then(() => {
    console.log('Bot iniciado')
    //comprobarTweets();
    setInterval(() => {
        console.log("Comprobando Tweets cada 10 minutos");
        comprobarTweets();
    },300000);
}
).catch(err => {
    console.log(err)
}
)




function comprobarTweets(){
    console.log('Comprobación de tweets nuevos')
    var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
    cuentasTwitter.forEach(cuenta => {
        obtenerTweets(cuenta.id, cuenta.name)
    });


}

 
async function obtenerTweets(id, name) {
   
    var tweets = await twitter.getTwett(id)
    for(const tweet of tweets){
        //Await 3 segundos para no saturar el BOT
        await new Promise(r => setTimeout(r, 3000));
          //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
    if(comprobarLog(tweet,name) === false){
        //Filtrar Tweet
        if( filtradoAcceso(tweet) === true){
            if(filtradoBlackList(tweet) === true){
                
                  
                       
                        try {
                            enviarMensaje(tweet, name, process.env.BOT_GroupToSend);
                        } catch (error) {
                            console.log(error)
                        }
               
                
            }else{
                 try {
                    enviarMensaje(tweet, name, process.env.BOT_ChannelToSend);
                 } catch (error) {
                    console.log(error)
                 }
                 
                     
              
                    
            }
           
        }
        
    }else{
            //Obtener hora y fecha actual 
            let fecha = new Date()
            let hora = fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds()
        //Guardar en .log fecha y hora del tweet
        console.log(`Mensaje con ID:  ${tweet.id} ya envíado. Cuenta:${name}  [${hora}]`)
     
    }
}
   
}

function enviarMensaje(tweet,name, destinatario){
 //Enviar tweet al grupo
 try {
    bot.telegram.sendMessage(destinatario,`${tweet.text}\n${name}`,
    //Send message without url preview
    {disable_web_page_preview: true})
 } catch (error) {
     console.log(error)
 }
    


 //Mensaje sin sonido = disable_notification: true

}

function comprobarLog(tweet, name){
        
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

 function filtradoAcceso(tweet){
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.whiteList;
    let blackList = result.blackList;
    let tweetText = tweet.text.toLowerCase();
    whiteList.forEach(element => {
        if(tweetText.includes(element.toLowerCase())){
       
            salida = true
        }
    })
    blackList.forEach(element => {
        if(tweetText.includes(element.toLowerCase())){
            salida = false
        }
    })   
    return salida
}
function filtradoBlackList(tweet){
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.blackListGroup;
    let tweetText = tweet.text.toLowerCase();
    whiteList.forEach(element => {
        if(tweetText.includes(element.toLowerCase())){
       
            salida = true
        }
    })
    return salida
}

function comprobarAdmin(ctx) {
    console.log('Comprobando permisos de administrador')
    let salida = false
    let id;
    if(ctx.update.message.chat.type === 'private'){
    id = ctx.message.from.id
    }else{
         id = ctx.update.message.from.id
    }
   
    if(id === null){
        id = ctx.update.message.from.id
    }
    if(usuariosAdmin.includes(id)){
        salida = true
    }

    return salida
  }

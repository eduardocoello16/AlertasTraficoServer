require('dotenv').config({
    path: './.env'
});
const fs = require('fs');
const filtro = require('./accionesBot/Filtro')
const twitter = require('./twitter')
const variables = require('./variables')
const errores = require('./errores.js')
const cAdmin = require('./accionesBot/admin')
//Variables usuarios

const usuariosAdmin = variables.usuariosAdmin
const grupoAdmins = variables.grupoAdmins
const grupoAlertas = variables.grupoAlertas
const canalAlertas = variables.canalAlertas
const bot = variables.bot




//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ')
bot.launch().then(() => {
    console.log('Bot iniciado')
    //comprobarTweets();
    setInterval(() => {
        console.log("Comprobando Tweets cada 10 minutos");
        comprobarTweets();
    }, 300000);
}).catch(err => {
    console.log(err)
})

// COMANDOS

// Iniciar el bot Bienvenido 
bot.start((ctx) => {
    //Get group id
    var id = ctx.update.message.chat;
   let nombre =  '';
   if(ctx.message.from.first_name){
    nombre = ' ' + ctx.message.from.first_name;
   }
    ctx.reply(`Hola${nombre}, este es el  BOT oficial de Alertas de Tráfico TNF`)
    //Mensaje para administradores: 
    if(cAdmin.comprobarAdmin(ctx) === true){
        ctx.reply('Para ver los comandos de administrador usa el comando /admincommands')
    }
})

//Comando para obtener lista de comandos para admins
bot.command('admincommands',(ctx) => {

    ctx.reply("-------------------- Comandos para los administradores ----------------\n\nComandos Tweets\n/obtenertweets - Para obtener los últimos tweets\n \nComandos para el Filtro\n/getwhitelist - Obtener la White List\n/getblacklist - Obtener la Black List\n /getblacklistgroup - Obtener la Black List para el grupo\n/addblacklist - Añade un elemento a la Black List\n/addwhitelist - Añade un elemento a la White List\n/addblacklistgroup - Añade un elemento a la Black List del grupo\n/delblacklist - Borra un elemento a la Black List\n/delwhitelist - Borra un elemento a la White List\n/delblacklistgroup - Borra un elemento a la Black List del grupo\n\nComandos archivo log errores\n/delerrorlog - Borra el fichero .log de errores\n/geterrorlog - Obtiene el fichero log de errores y se reenvía por aquí.\n\n Para moderadores \n/modooculto - Para los moderadores del grupo de administradores, puedan ponerse en anónimo en el grupo de alertas.")
})




bot.command('delerrorlog', (ctx) => {
    errores.borrarFichero(ctx);
})
bot.command('geterrorlog', (ctx) => {
    errores.obtenerFichero(ctx);
})


//Obtener el ID de un usuario
bot.command('getid', async (ctx) => {
    let id;
    if (ctx.update.message.chat.type === 'private') {
        id = ctx.message.from.id
    } else {
        id = ctx.update.message.chat.id
    }
    ctx.reply(id)
})

//Cambiar permisos un usuario a administrador y hacerlo anónimo
bot.command('modoooculto', async (ctx) => {

    if (await comprobarGrupoAdmin(ctx) === true) {
        let id = ctx.message.from.id
        //Comprobar que un usuario es anonimo
        let user = await bot.telegram.getChatMember(grupoAlertas, id)
       
        try {
            if (user.is_anonymous === true) {
                await bot.telegram.promoteChatMember(grupoAlertas, id, {
                    is_anonymous: false,
                    can_change_info: user.can_change_info,
                    can_delete_messages: user.can_delete_messages,
                    can_invite_users: user.can_invite_users,
                    can_restrict_members: user.can_restrict_members,
                    can_pin_messages: user.can_pin_messages,
                    can_promote_members: user.can_promote_members
                })
                ctx.reply(`${ctx.message.from.first_name} ha desactivado el modo oculto `)
            } else {
                 await bot.telegram.promoteChatMember(grupoAlertas, id, {
                        can_change_info: true,
                        can_delete_messages: true,
                        can_manage_chat: true,
                        can_invite_users: true,
                        can_restrict_members: true,
                        can_pin_messages: true,
                        can_manage_video_chats: true,
                        can_promote_members: false,
                        is_anonymous: true
                    })
                ctx.reply(`${ctx.message.from.first_name} ha activado el modo oculto `)
            }


        } catch (error) {
            console.log(error)
            ctx.reply('Ha ocurrido un error al cambiar el modo oculto. ¿Eres un administrador asignado por el bot?')
        }
    } else {
        ctx.reply('Comando solo para administradores')
    }
})

//Hacer un usuario administrador
bot.command('setadmin', async (ctx) => {
    if (comprobarAdmin(ctx) === true) {
      
        //Obtener usuario a añadir a la lista de administradores
        let id = ctx.message.text.split(' ')[1]
        //Comprobar que un usuario es anonimo
        try {
            let user = await bot.telegram.getChatMember(grupoAlertas, id)
            if (user.status === 'left') {
                ctx.reply('El usuario no está en el grupo')
            } else {
                //Añadir usuario a la lista de administradores
                try {
                    await bot.telegram.promoteChatMember(grupoAlertas, id, {
                        can_change_info: true,
                        can_delete_messages: true,
                        can_manage_chat: true,
                        can_invite_users: true,
                        can_restrict_members: true,
                        can_pin_messages: true,
                        can_manage_video_chats: true,
                        can_promote_members: false
                    })
                    ctx.reply(`Se han actualizado los permisos del usuario ${user.user.first_name} ${user.user.last_name}`)
                } catch (error) {
                    console.log(error)
                    ctx.reply('Error al añadir usuario')
                }
            }
        } catch (error) {
            console.log(error)
            ctx.reply('Id o nombre inválido')

        }
    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
})

//Quitar un usuario administrador
bot.command('deladmin', async (ctx) => {
    if (comprobarAdmin(ctx) === true) {
       
        //Obtener usuario a añadir a la lista de administradores
        let id = ctx.message.text.split(' ')[1]
        //Comprobar que un usuario es anonimo
        try {
            let user = await bot.telegram.getChatMember(grupoAlertas, id)
            if (user.status === 'left') {
                ctx.reply('El usuario no está en el grupo')
            } else {
                //Añadir usuario a la lista de administradores
                try {
                    await bot.telegram.promoteChatMember(grupoAlertas, id, {})
                    ctx.reply(`Se han actualizado los permisos del usuario ${user.user.first_name} ${user.user.last_name}`)
                } catch (error) {
                    console.log(error)
                    ctx.reply('Error al añadir usuario')
                }
            }
        } catch (error) {
            console.log(error)
            ctx.reply('Id o nombre inválido')
        }
    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
})


//Comandos FILTROS


//Comando /getBlackList -> Obtiene la BlackList del JSON 
bot.command('getblacklist', (ctx) => {
    
    filtro.getBlackList(ctx)
})
//Comando /getBlackListGroup -> Obtiene la BlackListGroup del JSON 
bot.command('getblacklistgroup', (ctx) => {
    filtro.getBlackListGroup(ctx)
})
//Comando /getWhiteList -> Obtiene la WhiteList del JSON 
bot.command('getwhitelist', (ctx) => {
 filtro.getWhiteList(ctx)
})
//Añadir a la BlackList del JSON
bot.command('addblacklist', (ctx) => {
    filtro.addBlackList(ctx);
})
//Añadir a la WhiteList del JSON
bot.command('addwhitelist', (ctx) => {
    filtro.addWhiteList(ctx);
}) 
//Añadir a la BlackListGroup del JSON
bot.command('addblacklistgroup',  (ctx) => {
  filtro.addBlackListGroup(ctx);
})  

// Borrar de la whiteList 

bot.command('delwhitelist', async (ctx) => {
    filtro.delWhiteList(ctx);
}) 

// Borrar de la BlackList 

bot.command('delblacklist', async (ctx) => {
   filtro.delBlackList(ctx);
}) 

// Borrar de la Black group List 

bot.command('delblacklistgroup', async (ctx) => {
  filtro.delBlackListGroup(ctx);
}) 

//Funciónes Obtener tweets

//Comprobar tweets nuevos
 function comprobarTweets() {
    console.log('Comprobación de tweets nuevos')
    var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
   
      
    for(let cuenta of cuentasTwitter){
       // await new Promise(r => setTimeout(r, 1000));
        obtenerTweets(cuenta.id, cuenta.name)
    }
}

//Obtener tweets llamando a la API twitter

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 

var enfriamiento = true;

bot.command('obtenertweets', async (ctx) => {
 
    if((ctx.message.chat.id == grupoAdmins) || (comprobarAdmin(ctx) === true)){
        
    if (enfriamiento === true) {
        enfriamiento = false
        comprobarTweets()
        ctx.reply('Obteniendo todos los tweets...')
         //Set timeout para cambiar de estado a false de 2 minutos
        setTimeout(() => {
            enfriamiento = true;
        }, 120000);
    }else{
       
        ctx.reply('El bot está enfriado por favor espera unos minutos (Tiempo total de espera: 2 minutos)')
    }
   

    

} else{
    ctx.reply('No tienes permisos para ejecutar este comando')
}
} )


async function obtenerTweets(id, name) {

    var tweet = await twitter.getTwett(id)
   
        //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
        if (comprobarLog(tweet, id) === false) {
            //Filtrar Tweet
            if (filtradoAcceso(tweet) === true) {
                if (filtradoBlackListGroup(tweet) === true) {



                    try {
                        enviarMensaje(tweet, name, grupoAlertas);
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    try {
                        enviarMensaje(tweet, name, canalAlertas);
                    } catch (error) {
                        console.log(error)
                    }
                }

            }

        } else {
            //Obtener hora y fecha actual 
            /*
            let fecha = new Date()
            let hora = fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds()
            //Guardar en .log fecha y hora del tweet
            console.log(`Mensaje con ID:  ${tweet.id} ya envíado. Cuenta:${name}  [${hora}]`)*/

        }
    }



function enviarMensaje(tweet, name, destinatario) {
    //Enviar tweet al grupo
    try {
        bot.telegram.sendMessage(destinatario, `${tweet.text}\n${name}`,
            //Send message without url preview
            {
                disable_web_page_preview: true
            })
    } catch (error) {
        console.log(error)
    }
    //Mensaje sin sonido = disable_notification: true
}

function comprobarLog(tweet, id) {
let salida = false;
//Comprobar si el archivo bot.log existe, si no crearlo
if (fs.existsSync('./ultimosTweets.json') === false) {
    fs.writeFileSync('./ultimosTweets.json', '[]')

}
  //Comprobar un registro .log si el tweet se ha enviado
  try {
    var json = fs.readFileSync('./ultimosTweets.json', 'utf8')
    let ultimosTweets = JSON.parse(json)
    let nuevoTweet = {
        idTweet: tweet.id,
        idCuenta: id
       }
  let cuentaEncontrada = ultimosTweets.findIndex(e => e.idCuenta === id);
  
  if(cuentaEncontrada != -1){
   if( ultimosTweets[cuentaEncontrada].idTweet === tweet.id){
  
   salida = true;
   }else{
    ultimosTweets.splice(cuentaEncontrada, 1)
    
        ultimosTweets.push(nuevoTweet)
        fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets))
       
     
  
   }
  }else{
    ultimosTweets.push(nuevoTweet)
    fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets))
  }
  
  } catch (error) {
    console.log(error)
  }
 
    return salida
    
}

function filtradoAcceso(tweet) {
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.whiteList;
    let blackList = result.blackList;
    let tweetText = tweet.text.toLowerCase()
    let arrayTweetText = tweetText.split(' ');
    try {
        whiteList.forEach(element => {
            if (arrayTweetText.includes(element.toLowerCase())) {
    
                salida = true
            }
        })
        blackList.forEach(element => {
            if (arrayTweetText.includes(element.toLowerCase())) {
               
                salida = false
            }
        })
    } catch (error) {
        console.log(error)
    }
    
    return salida
}

function filtradoBlackListGroup(tweet) {
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let blackListGroup = result.blackListGroup;
    let tweetText = tweet.text.toLowerCase();
    let arrayTweetText = tweetText.split(' ');
    blackListGroup.forEach(element => {
        if (arrayTweetText.includes(element.toLowerCase())) {

            salida = true
        }
    })
    return salida
}

function comprobarAdmin(ctx) {
   
    let salida = false
    let id;
    if (ctx.update.message.chat.type === 'private') {
        id = ctx.message.from.id
    } else {
        id = ctx.update.message.from.id
    }

    if (id === null) {
        id = ctx.update.message.from.id
    }
    if (usuariosAdmin.includes(id)) {
        salida = true
    }

    return salida
}

async function comprobarGrupoAdmin(ctx){
    let salida = false
   let id = ctx.message.from.id
    let user = await bot.telegram.getChatMember(grupoAdmins, id)
    if(user.status != 'left'){
        salida = true
    }
   
    return salida
}
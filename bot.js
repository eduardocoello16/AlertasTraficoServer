require('dotenv').config({
    path: './.env'
});
const fs = require('fs');
const filtro = require('./accionesBot/Filtro')
const twitter = require('./twitter')
const variables = require('./variables')
const errores = require('./errores.js')
//Variables usuarios

const usuariosAdmin = variables.usuariosAdmin
const grupoAdmins = variables.grupoAdmins
const grupoAlertas = variables.grupoAlertas
const canalAlertas = variables.canalAlertas
const bot = variables.bot

//Comprobar si el archivo bot.log existe, si no crearlo
if (fs.existsSync('./bot.log') === false) {
    fs.writeFileSync('./bot.log', 'Registro de tweets enviados al canal\n')

}



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
   
    ctx.reply('Hola, bienvenído al BOT  de Alertas de Tráfico TNF')
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
bot.command('modoOculto', async (ctx) => {

    if (await comprobarGrupoAdmin(ctx) === true) {
        let id = ctx.message.from.id
        //Comprobar que un usuario es anonimo
        let user = await bot.telegram.getChatMember(grupoAlertas, id)
        console.log(user)
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
bot.command('setAdmin', async (ctx) => {
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
bot.command('delAdmin', async (ctx) => {
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

bot.command('delWhiteList', async (ctx) => {
    if (comprobarAdmin(ctx) === true) {
        let filtro = obtenerFiltro()
        if(ctx.message.text.split(' ').length != 2){
            ctx.reply('Solo se puede borrar de una en una palabra a la WhiteList')
        }
        else{
            //Comprobar que la palabra está en el array del filtro
            let posEncontrado = filtro.whiteList.indexOf(ctx.message.text.split(' ')[1])
            if(posEncontrado === -1){
                //No está en el filtro
                ctx.reply('La palabra no está en el filtro')
            }else{
                filtro.whiteList.splice(posEncontrado, 1)
                guardarFiltro(filtro)
                ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
            }
        }
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
}) 

// Borrar de la BlackList 

bot.command('delBlackList', async (ctx) => {
    if (comprobarAdmin(ctx) === true) {
        let filtro = obtenerFiltro()
        if(ctx.message.text.split(' ').length != 2){
            ctx.reply('Solo se puede borrar de una en una palabra a la BlackList')
        }
        else{
            //Comprobar que la palabra está en el array del filtro
            let posEncontrado = filtro.blackList.indexOf(ctx.message.text.split(' ')[1])
            if(posEncontrado === -1){
                //No está en el filtro
                ctx.reply('La palabra no está en el filtro')
            }else{
                filtro.blackList.splice(posEncontrado, 1)
                guardarFiltro(filtro)
                ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
            }
        }
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
}) 

// Borrar de la Black group List 

bot.command('delBlackGroupList', async (ctx) => {
    if (comprobarAdmin(ctx) === true) {
        let filtro = obtenerFiltro()
        if(ctx.message.text.split(' ').length != 2){
            ctx.reply('Solo se puede borrar de una en una palabra a la Black Group List')
        }
        else{
            //Comprobar que la palabra está en el array del filtro
            let posEncontrado = filtro.blackListGroup.indexOf(ctx.message.text.split(' ')[1])
            if(posEncontrado === -1){
                //No está en el filtro
                ctx.reply('La palabra no está en el filtro')
            }else{
                filtro.blackListGroup.splice(posEncontrado, 1)
                guardarFiltro(filtro)
                ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
            }
        }
    }else{
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
}) 


function obtenerFiltro() {
    //Comprobar el usuario es admin
        let rawdata = fs.readFileSync('filtro.json');
        let result = JSON.parse(rawdata);
        return result 
}

function guardarFiltro(filtro) {
    fs.writeFileSync('filtro.json', JSON.stringify(filtro))
}


//Funciónes Obtener tweets

//Comprobar tweets nuevos
function comprobarTweets() {
    console.log('Comprobación de tweets nuevos')
    var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
    cuentasTwitter.forEach(cuenta => {
        obtenerTweets(cuenta.id, cuenta.name)
    });


}

//Obtener tweets llamando a la API twitter

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 

var enfriamiento = true;

bot.command('obtenerTweets', async (ctx) => {
  console.log('Chat id' + ctx.message.chat.id)
  console.log('Grupo admins ' + grupoAdmins)
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

    var tweets = await twitter.getTwett(id)
    for (const tweet of tweets) {
        //Await 3 segundos para no saturar el BOT
        await new Promise(r => setTimeout(r, 3000));
        //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
        if (comprobarLog(tweet, name) === false) {
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

function comprobarLog(tweet, name) {

    //Comprobar un registro .log si el tweet se ha enviado
    var log = fs.readFileSync('./bot.log', 'utf8')
    if (log.includes(tweet.id)) {
        return true
    } else {
        //Añade el id del  tweet al .log
        fs.appendFileSync('./bot.log', `Id Tweet: ${tweet.id}\nUsuario: ${name}` + `\n${new Date()}\n`)
        return false
    }
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
                console.log(element)
                console.log(tweet.text)
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
    console.log(user)
    return salida
}
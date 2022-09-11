require('dotenv').config({
    path: './.env'
});


const fs = require('fs');
const { Markup } = require('telegraf');
const filtro = require('./accionesBot/Filtro')
const twitter = require('./twitter')
const variables = require('./variables')
const errores = require('./errores.js')
const cAdmin = require('./accionesBot/admin') 
var express = require('express');
const webBot = require('./webBot/webBot')
const database = require('./webBot/database');
const { update } = require('./webBot/models/user');
//Variables usuarios
const grupoAdmins = variables.grupoAdmins
const grupoAlertas = variables.grupoAlertas
const canalAlertas = variables.canalAlertas
const bot = variables.bot

//Express
//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ')
bot.launch().then(() => {
    console.log('Bot iniciado')
    setInterval(() => {
        console.log("Comprobando Tweets cada 5 minutos");
        comprobarTweets();
    }, 150000);
}).catch(err => {
    console.log(err)
})

//Abrir las rutas de express pasándole el bot.
webBot.rutas(bot)


// COMANDOS

// Iniciar el bot Bienvenido 
bot.start((ctx) => {
    //Get group id
    var id = ctx.update.message.chat;
    let nombre = '';
    if (ctx.message.from.first_name) {
        nombre = ' ' + ctx.message.from.first_name;
    }
    ctx.reply(`Hola${nombre}, este es el  BOT oficial de Alertas de Tráfico TNF`)
    //Mensaje para administradores: 
    if (cAdmin.comprobarAdmin(ctx) === true) {
        ctx.reply('Para ver los comandos de administrador usa el comando /admincommands')
    }
})

//Comando para obtener lista de comandos para admins
bot.command('admincommands', async (ctx) => {

    ctx.reply("---- Comandos para los administradores ----\n\nComandos Tweets\n/obtenertweets - Para obtener los últimos tweets\n \nComandos para el Filtro\n/getwhitelist - Obtener la White List\n/getblacklist - Obtener la Black List\n /getblacklistgroup - Obtener la Black List para el grupo\n/addblacklist - Añade un elemento a la Black List\n/addwhitelist - Añade un elemento a la White List\n/addblacklistgroup - Añade un elemento a la Black List del grupo\n/delblacklist - Borra un elemento a la Black List\n/delwhitelist - Borra un elemento a la White List\n/delblacklistgroup - Borra un elemento a la Black List del grupo\n\nComandos archivo log errores\n/delerrorlog - Borra el fichero .log de errores\n/geterrorlog - Obtiene el fichero log de errores y se reenvía por aquí.\n\n Para moderadores \n/modooculto - Para los moderadores del grupo de administradores, puedan ponerse en anónimo en el grupo de alertas.")
})



bot.command('broadcast', (ctx) => {
    cAdmin.broadcast(ctx, bot);
})


bot.command('delerrorlog', (ctx) => {
    errores.borrarFichero(ctx);
})
bot.command('geterrorlog', (ctx) => {
    errores.obtenerFichero(ctx);
})


//Obtener el ID de un usuario+
/*
bot.command('getid', async (ctx) => {
    let id;
    if (ctx.update.message.chat.type === 'private') {
        id = ctx.message.from.id
    } else {
        id = ctx.update.message.chat.id
    }
    ctx.reply(id)
})
*/

//Cambiar permisos un usuario a administrador y hacerlo anónimo
bot.command('modooculto', (ctx) => {
    moders.modoOculto(ctx, bot);
})

//Quitar un usuario administrador
bot.command('deladmin', async (ctx) => {
    cAdmin.deleteAdmin(ctx, bot);
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
bot.command('addblacklistgroup', (ctx) => {
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
async function comprobarTweets(ctx) {
    let datos = await database.getBotData(variables.bot_db_name)
    if(datos.obtenerTweets){
    var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
    for  (let cuenta of cuentasTwitter) {
       
         if(ctx){
            ctx.reply('Obteniendo ultimo tweet de la cuenta ' + cuenta.name)
         }else{
            console.log('Obteniendo ultimo tweet de la cuenta ' + cuenta.name)
         }
        
       await obtenerTweets(cuenta.id, cuenta.name)
       
       
    }
   if(ctx){
    ctx.reply('Finalizado')
   }else{
    console.log('Finalizado')
   }
}else{
   
        console.log('La obtención de tweets está deshabilitada')
     
}
}

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 
bot.command('switchusuarioalerta', async (ctx) => { 
    if(cAdmin.comprobarAdmin(ctx)){

  
    let state = await database.getBotData(variables.bot_db_name)
    if(state.usuariosPublicaciones){
        state.usuariosPublicaciones = false
        await database.save_obtenerTweets_state(state)
        ctx.reply('La publicación de alertas por parte de usuarios se ha desactivado.')
       }else{
        state.usuariosPublicaciones = true
        await database.save_obtenerTweets_state(state)
        ctx.reply('La publicación de alertas por parte de usuarios se ha activado.')
       }  }else{
        ctx.reply('Necesitas ser administrador para ejecutar este comando.')
       }
})

//Obtener tweets llamando a la API twitter

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 
bot.command('switchobtenertweets', async (ctx) => { 
    if(cAdmin.comprobarAdmin(ctx)){

  
    let state = await database.getBotData(variables.bot_db_name)
    if(state.obtenerTweets){
        state.obtenerTweets = false
        await database.save_obtenerTweets_state(state)
        ctx.reply('La obtención de tweets se ha desactivado')
       }else{
        state.obtenerTweets = true
        await database.save_obtenerTweets_state(state)
        ctx.reply('La obtención de tweets se ha activado')
       }  }else{
        ctx.reply('Necesitas ser administrador para ejecutar este comando.')
       }
})

bot.command('obtenertweets', async (ctx) => {
   let datos = await database.getBotData(variables.bot_db_name)
    if(datos.obtenerTweets){
        console.log('Comprobación de tweets nuevos (Comando Usuario) - ' + new Date )
    
    
    if ((ctx.message.chat.id == grupoAdmins) || (cAdmin.comprobarAdmin(ctx) === true)) {

        if (variables.enfriamiento === true) {
            variables.enfriamiento = false
            comprobarTweets(ctx)
           
            //Set timeout para cambiar de estado a false de 2 minutos
            setTimeout(() => {
                variables.enfriamiento = true;
            }, 60000);
        } else {

            ctx.reply('El bot está enfriado por favor espera unos minutos (Tiempo total de espera: 1 minutos)')
        }




    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
}else{
    ctx.reply('La obtención de tweets está deshabilitada')
}
})


async function obtenerTweets(id, name) {

    var tweet = await twitter.getTwett(id)

    //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
    if (comprobarUltimosTweets(tweet, id) === false) {
        //Filtrar Tweet
        if (await filtro.filtradoAcceso(tweet) === true) {
            if (await filtro.filtradoBlackListGroup(tweet) === true) {
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
        return true

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
        bot.telegram.sendMessage(destinatario, `${tweet.text}\nCuenta Twitter: ${name}`,
            //Send message without url preview
            {
                disable_web_page_preview: true
            })
    } catch (error) {
        console.log(error)
    }
    //Mensaje sin sonido = disable_notification: true
}

function comprobarUltimosTweets(tweet, id) {
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

        if (cuentaEncontrada != -1) {
            if (ultimosTweets[cuentaEncontrada].idTweet === tweet.id) {

                salida = true;
            } else {
                ultimosTweets.splice(cuentaEncontrada, 1)

                ultimosTweets.push(nuevoTweet)
                fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets))



            }
        } else {
            ultimosTweets.push(nuevoTweet)
            fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets))
        }

    } catch (error) {
        console.log(error)
    }

    return salida

}




 
bot.on('inline_query', async (ctx) => {
    
    let id  = ctx.update.inline_query.from.id
   let usuario = await  database.obtenerUsuario(id)
    let respuesta = ctx.update.inline_query.query;

    let desactivado = [
        
        {
            type: 'article',
            id: 'alerta_deny',
            title: 'Las alertas están desactivadas',
            input_message_content: {
                message_text: 'Enviar alertas al canal está desactivado.'
            },
            description: 'Ya eres usuario! Pero las alertas están desactivadas actualmente.'
            
        }
    
]

    let solicitar_deny = [
        //Se deniega ya que el tiempo es inválido
        {
            type: 'article',
            id: 'solicitar_deny',
            title: 'Solicitar enviar alertas',
            input_message_content: {
                message_text: 'Para hacer otra solicitud tendrás que esperar hasta un maximo de 24h.'
            },
            description: 'Parece que tendrás que esperar 24h'
            
        }
    
]
    let solicitar = [
        
            {
                type: 'article',
                id: 'solicitar',
                title: 'Solicitar enviar alertas',
                input_message_content: {
                    message_text: 'Se ha enviado  tu solicitud'
                },
                description: 'Para enviar alertas necesita que un admin te valide.'
                
            }
        
    ]
    let results = [
        {
            type: 'article',
            id: 'Radar',
            title: 'Radar',
            input_message_content: {
                message_text: respuesta + '. \n Fue enviado al canal.' 
            },
            description: 'Envía una nueva alerta al canal.'
            
        },
        {
            type: 'article',
            id: 'Accidente',
            title: 'Accidente',
            input_message_content: {
                message_text: respuesta + ' se ha envíado'
            },
            description: 'Envía una nueva alerta al canal.'
            
        },
        {
            type: 'article',
            id: 'Retenciones',
            title: 'Retenciones',
            input_message_content: {
                message_text:   `${respuesta}\n  Este mensaje fue enviado al canal.`
            },
            description: 'Envía una nueva alerta al canal.'
        },
        {
            type: 'article',
            id: 'Obra',
            title: 'Obra',
            input_message_content: {
                message_text:   `${respuesta}\n  Este mensaje fue enviado al canal.`
            },
            description: 'Envía una nueva alerta al canal.',
            reply_markup:{
                keyboards: [
                    [
                        {
                            text: 'Enviar', callback_data: 'enviar'
                        }
                    ]
                ]
            }
        }
    ]
   try {
    if(usuario){
        if(usuario.status_user === 'pending'){
        let fecha = new Date(usuario.Date_request)
        let fechahoy = new Date()
        let milisegundosDia  = 24*60*60*1000;
        let milisegundostranscurridos = Math.abs(fecha.getTime() - fechahoy.getTime())
        let diatransc = Math.round(milisegundostranscurridos/milisegundosDia)
        if(diatransc === 0){
         
            ctx.answerInlineQuery(solicitar_deny)
        }else{
        
            ctx.answerInlineQuery(solicitar)
            database.actualizarFechaCreation(usuario)
        }
    }else{
        if(usuario.status_user === 'active'){
            let servicioactivo = await database.getBotData(variables.bot_db_name)
            if(servicioactivo.usuariosPublicaciones){

                ctx.answerInlineQuery(results)
            }else{
                ctx.answerInlineQuery(desactivado)
            }
           
        }
    }
    }else{
        ctx.answerInlineQuery(solicitar)
    }
  
	
} catch (error) {
	console.log(error)
}


})



bot.on('chosen_inline_result', async (ctx) => {


  try {
    if(ctx.update.chosen_inline_result.result_id === 'solicitar'){
        console.log(ctx.update.chosen_inline_result.from)
       try {
         let user = await database.crearUsuario(ctx.update.chosen_inline_result.from)
        if(user){
         enviarSolicitud(user)
        }
       } catch (error) {
         console.log(error)
       }
      
        }
  } catch (error) {
    console.log(error)
  }
    

})


async function enviarSolicitud(user){
    try {
        
   
   if(user){
    let message = `El usuario ${user.first_name} ${user.last_name} solicita permiso para hacer publicaciones en el canal.`;
    bot.telegram.sendMessage(variables.grupoAdmins, message, {
     ...Markup.inlineKeyboard([
       [
       Markup.button.callback('Aceptar', `aceptar_solicitud:${user.id}`),
       Markup.button.callback('Denegar', `denegar_solicitud:${user.id}`),
       ], 
       [
           Markup.button.callback('Denegar y bloquear', `ban_solicitud:${user.id}`),
       ],
       [
           Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
       ]
     ]
     )
   })
   }
  
} catch (error) {
        console.log(error)
}

}


  bot.action(/aceptar_solicitud:(\d+)/, async ctx => {
  console.log()
    const [, userId] = ctx.match
   let user = await database.obtenerUsuario(userId)
   let aceptada;
   if(user){
    aceptada = await database.aceptarSolicitud(userId)
   }
   if(aceptada){

  
    let mensaje = `El usuario ${ctx.update.callback_query.from.first_name} ${ctx.update.callback_query.from.last_name} ha aceptado al usuario ${user.first_name} para que pueda publicar cosas en el canal. `
  ctx.editMessageText(
    mensaje, {
        ...Markup.inlineKeyboard([
          [
              Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
          ],
          [
            Markup.button.callback('Banear', `ban_solicitud:${user.id}`)
        ]
        ]
        )
      }
  )
   
}
  })
  
  
  bot.action(/denegar_solicitud:(\d+)/, ctx => {
    console.log('Denegar')
    const [, userId] = ctx.match
    console.log(ctx)
  })

  bot.action(/ban_solicitud:(\d+)/, ctx => {
    console.log('Ban')
    const [, userId] = ctx.match
    console.log(userId)
  })

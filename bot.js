require('dotenv').config({
    path: './.env'
});

const HmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')
const crypto = require('crypto-js')
const fs = require('fs');
const filtro = require('./accionesBot/Filtro')
const twitter = require('./twitter')
const variables = require('./variables')
const errores = require('./errores.js')
const cAdmin = require('./accionesBot/admin') 
var express = require('express');
var app = express();
var bp = require('body-parser')
const cors = require('cors')
//Variables usuarios
const grupoAdmins = variables.grupoAdmins
const grupoAlertas = variables.grupoAlertas
const canalAlertas = variables.canalAlertas
const bot = variables.bot

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())
app.listen(2000, () =>{
    console.log("Servidor levantado correctamente en  http://localhost:" + 2000 )
})

 
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
    
    var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);


    for await (let cuenta of cuentasTwitter) {
       
         if(ctx){
            ctx.reply('Obteniendo ultimo tweet de la cuenta ' + cuenta.name)
         }else{
            console.log('Obteniendo ultimo tweet de la cuenta ' + cuenta.name)
         }
        
        obtenerTweets(cuenta.id, cuenta.name)
         //Esperar un tiempo
        await new Promise(r => setTimeout(r, 1000));
       
    }
   if(ctx){
    ctx.reply('Finalizado')
   }else{
    console.log('Finalizado')
   }
}



//Obtener tweets llamando a la API twitter

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 

var enfriamiento = true;

bot.command('obtenertweets', async (ctx) => {
    console.log('Comprobación de tweets nuevos (Comando Usuario) - ' + new Date )
    if ((ctx.message.chat.id == grupoAdmins) || (cAdmin.comprobarAdmin(ctx) === true)) {

        if (enfriamiento === true) {
            enfriamiento = false
            comprobarTweets(ctx)
            ctx.reply('Obteniendo todos los tweets...')
            //Set timeout para cambiar de estado a false de 2 minutos
            setTimeout(() => {
                enfriamiento = true;
            }, 60000);
        } else {

            ctx.reply('El bot está enfriado por favor espera unos minutos (Tiempo total de espera: 1 minutos)')
        }




    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
})


async function obtenerTweets(id, name) {

    var tweet = await twitter.getTwett(id)

    //Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
    if (comprobarUltimosTweets(tweet, id) === false) {
        //Filtrar Tweet
        if (filtro.filtradoAcceso(tweet) === true) {
            if (filtro.filtradoBlackListGroup(tweet) === true) {



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


//Express
function comprobarHash(WebAppData, hash, bot_token){
    const q = new URLSearchParams(WebAppData);
    q.delete("hash");
     const v = Array.from(q.entries());
      v.sort(([aN, aV], [bN, bV]) => aN.localeCompare(bN));
      const data_check_string = v.map(([n, v]) => `${n}=${v}`).join("\n");
      var secret_key = HmacSHA256(variables.botToken, "WebAppData")
      var key = HmacSHA256(data_check_string, secret_key).toString(Hex);
    var salida = false;
      if(hash == key){
        salida = true
        console.log('Correcto')
        
      }

      return salida
}


app.post('/respuesta', function(req, res){
  
 
    })




//Comprobar si el usuario está en el grupo
app.post('/usuariogrupo', async function(req, res) {
    let id = req.body.id
    let hash = req.body.hash
    let WebAppData = req.body.WebAppData
    const bot_token = variables.WebAppData

    if(comprobarHash(WebAppData, hash, bot_token)){

   

    try {
        let user = await bot.telegram.getChatMember(variables.grupoAlertas, id)
        if(user.status === 'left'){
            res.status(200).send(false)
        }else{
          //  bot.telegram.sendMessage(user.user.id, 'Se abrió la web ' +  user.user.first_name)
            res.status(200).send(true)
        }
        
    } catch (error) {
        console.log(user)
        console.log(error)
        res.status(200).send(false)
    }
    
}else{
    res.status(500).send({
        "msg": "El hash del bot no es válido."
    })
}
   });
   
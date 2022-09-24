const variables = require('../variables');
const cAdmin = require('./admin');
const fs = require('fs');
const twitter = require('../twitter');
const filtro = require('./Filtro');

//Variables usuarios
const grupoAdmins = variables.grupoAdmins;
const grupoAlertas = variables.grupoAlertas;
const canalAlertas = variables.canalAlertas;
var enfriamiento = true;
//Funciónes Obtener tweets
function twitterCommands(bot, database){
	
	bot.command('obtenertweets', async (ctx) => {
		let datos = await database.getBotData(variables.bot_db_name);
		if(datos.obtenerTweets){
			//console.log('Comprobación de tweets nuevos (Comando Usuario) - ' + new Date );
        
        
			if ((ctx.message.chat.id == grupoAdmins) || (cAdmin.comprobarAdmin(ctx) === true)) {
    
				if (enfriamiento === true) {
					enfriamiento = false;
					comprobarTweets(ctx,bot,database);
               
					//Set timeout para cambiar de estado a false de 2 minutos
					setTimeout(() => {
						enfriamiento = true;
					}, 60000);
				} else {
    
					ctx.reply('El bot está enfriado por favor espera unos minutos (Tiempo total de espera: 1 minutos)');
				}
    
    
    
    
			} else {
				ctx.reply('No tienes permisos para ejecutar este comando');
			}
		}else{
			ctx.reply('La obtención de tweets está deshabilitada');
		}
	});
}
//Comprobar tweets nuevos
async function comprobarTweets(ctx,bot,database) {
	let datos = await database.getBotData(variables.bot_db_name);
	if(datos.obtenerTweets){
		var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
		for  (let cuenta of cuentasTwitter) {
       
			if(ctx){
				ctx.reply('Obteniendo ultimo tweet de la cuenta ' + cuenta.name);
			}
        
			await obtenerTweets(cuenta.id, cuenta.name,bot);
       
       
		}
		if(ctx){
			ctx.reply('Finalizado');
		}
	}else{
   
		console.log('La obtención de tweets está deshabilitada');
     
	}
}




async function obtenerTweets(id, name,bot) {

	var tweet = await twitter.getTwett(id);

	//Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
	if (comprobarUltimosTweets(tweet, id) === false) {
		//Filtrar Tweet
		if (await filtro.filtradoAcceso(tweet) === true) {
			if (await filtro.filtradoBlackListGroup(tweet) === true) {
				try {
                    
					enviarMensaje(tweet, name, grupoAlertas,bot);
				} catch (error) {
					console.log(error);
				}
			} else {
				try {
					enviarMensaje(tweet, name, canalAlertas,bot);
				} catch (error) {
					console.log(error);
				}
			}

		}
		return true;

	} else {
		//Obtener hora y fecha actual 
		/*
        let fecha = new Date()
        let hora = fecha.getHours() + ':' + fecha.getMinutes() + ':' + fecha.getSeconds()
        //Guardar en .log fecha y hora del tweet
        console.log(`Mensaje con ID:  ${tweet.id} ya envíado. Cuenta:${name}  [${hora}]`)*/

	}
}



function enviarMensaje(tweet, name, destinatario,bot) {

	//Enviar tweet al grupo
	try {
		bot.telegram.sendMessage(destinatario, `${tweet.text}\nCuenta Twitter: ${name}`,
			//Send message without url preview
			{
				disable_web_page_preview: true
			});
	} catch (error) {
		console.log(error);
	}
	//Mensaje sin sonido = disable_notification: true
}

function comprobarUltimosTweets(tweet, id) {
	let salida = false;
	//Comprobar si el archivo bot.log existe, si no crearlo
	if (fs.existsSync('./ultimosTweets.json') === false) {
		fs.writeFileSync('./ultimosTweets.json', '[]');

	}
	//Comprobar un registro .log si el tweet se ha enviado
	try {
		var json = fs.readFileSync('./ultimosTweets.json', 'utf8');
		let ultimosTweets = JSON.parse(json);
		let nuevoTweet = {
			idTweet: tweet.id,
			idCuenta: id
		};
		let cuentaEncontrada = ultimosTweets.findIndex(e => e.idCuenta === id);

		if (cuentaEncontrada != -1) {
			if (ultimosTweets[cuentaEncontrada].idTweet === tweet.id) {

				salida = true;
			} else {
				ultimosTweets.splice(cuentaEncontrada, 1);

				ultimosTweets.push(nuevoTweet);
				fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets));



			}
		} else {
			ultimosTweets.push(nuevoTweet);
			fs.writeFileSync('ultimosTweets.json', JSON.stringify(ultimosTweets));
		}

	} catch (error) {
		console.log(error);
	}

	return salida;

}

module.exports = {
	twitterCommands,
	comprobarTweets
};
require('dotenv').config({
	path: './.env'
});
const fs = require('fs');
const filtro = require('./accionesBot/Filtro');
const twitter = require('./twitter');
const variables = require('./variables');
const errores = require('./errores.js');
const cAdmin = require('./accionesBot/admin'); 
const webBot = require('./webBot/webBot');
const database = require('./webBot/database');
const moders = require('./accionesBot/moders');
const webBotActions = require('./accionesBot/webBotActions');
const inlineActions = require('./accionesBot/inlineActions');
//Variables usuarios
const grupoAdmins = variables.grupoAdmins;
const grupoAlertas = variables.grupoAlertas;
const canalAlertas = variables.canalAlertas;
const bot = variables.bot;

//Express
//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ');
bot.launch().then(() => {
	console.log('Bot iniciado');
	setInterval(() => {
		console.log('Comprobando Tweets cada 5 minutos');
		comprobarTweets();
	}, 150000);
}).catch(err => {
	console.log(err);
});


//Abrir las rutas de express pasándole el bot.
webBot.rutas(bot, database);

//Funciones del filtro
filtro.comandosFiltro(bot);

// COMANDOS

// Iniciar el bot Bienvenido 
bot.start((ctx) => {
	//Get group id

	let nombre = '';
	if (ctx.message.from.first_name) {
		nombre = ' ' + ctx.message.from.first_name;
	}
	ctx.reply(`Hola${nombre}, este es el  BOT oficial de Alertas de Tráfico TNF`);
	//Mensaje para administradores: 
	if (cAdmin.comprobarAdmin(ctx) === true) {
		ctx.reply('Para ver los comandos de administrador usa el comando /admincommands');
	}
});
cAdmin.adminCommands(bot);
errores.commands(bot);
moders.modersCommands(bot);

//Cambiar permisos un usuario a administrador y hacerlo anónimo






//Funciónes Obtener tweets

//Comprobar tweets nuevos
async function comprobarTweets(ctx) {
	let datos = await database.getBotData(variables.bot_db_name);
	if(datos.obtenerTweets){
		var cuentasTwitter = JSON.parse(process.env.Twitter_Accounts);
		for  (let cuenta of cuentasTwitter) {
       
			if(ctx){
				ctx.reply('Obteniendo ultimo tweet de la cuenta ' + cuenta.name);
			}else{
				console.log('Obteniendo ultimo tweet de la cuenta ' + cuenta.name);
			}
        
			await obtenerTweets(cuenta.id, cuenta.name);
       
       
		}
		if(ctx){
			ctx.reply('Finalizado');
		}else{
			console.log('Finalizado');
		}
	}else{
   
		console.log('La obtención de tweets está deshabilitada');
     
	}
}

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 
bot.command('switchusuarioalerta', async (ctx) => { 
	if(cAdmin.comprobarAdmin(ctx)){

  
		let state = await database.getBotData(variables.bot_db_name);
		if(state.usuariosPublicaciones){
			state.usuariosPublicaciones = false;
			await database.save_obtenerTweets_state(state);
			ctx.reply('La publicación de alertas por parte de usuarios se ha desactivado.');
		}else{
			state.usuariosPublicaciones = true;
			await database.save_obtenerTweets_state(state);
			ctx.reply('La publicación de alertas por parte de usuarios se ha activado.');
		}  }else{
		ctx.reply('Necesitas ser administrador para ejecutar este comando.');
	}
});

//Obtener tweets llamando a la API twitter

//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 
bot.command('switchobtenertweets', async (ctx) => { 
	if(cAdmin.comprobarAdmin(ctx)){

  
		let state = await database.getBotData(variables.bot_db_name);
		if(state.obtenerTweets){
			state.obtenerTweets = false;
			await database.save_obtenerTweets_state(state);
			ctx.reply('La obtención de tweets se ha desactivado');
		}else{
			state.obtenerTweets = true;
			await database.save_obtenerTweets_state(state);
			ctx.reply('La obtención de tweets se ha activado');
		}  }else{
		ctx.reply('Necesitas ser administrador para ejecutar este comando.');
	}
});

bot.command('obtenertweets', async (ctx) => {
	let datos = await database.getBotData(variables.bot_db_name);
	if(datos.obtenerTweets){
		console.log('Comprobación de tweets nuevos (Comando Usuario) - ' + new Date );
    
    
		if ((ctx.message.chat.id == grupoAdmins) || (cAdmin.comprobarAdmin(ctx) === true)) {

			if (variables.enfriamiento === true) {
				variables.enfriamiento = false;
				comprobarTweets(ctx);
           
				//Set timeout para cambiar de estado a false de 2 minutos
				setTimeout(() => {
					variables.enfriamiento = true;
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


async function obtenerTweets(id, name) {

	var tweet = await twitter.getTwett(id);

	//Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
	if (comprobarUltimosTweets(tweet, id) === false) {
		//Filtrar Tweet
		if (await filtro.filtradoAcceso(tweet) === true) {
			if (await filtro.filtradoBlackListGroup(tweet) === true) {
				try {
                    
					enviarMensaje(tweet, name, grupoAlertas);
				} catch (error) {
					console.log(error);
				}
			} else {
				try {
					enviarMensaje(tweet, name, canalAlertas);
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



function enviarMensaje(tweet, name, destinatario) {

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




 
bot.on('inline_query', async (ctx) => {
    
	inlineActions.crearAlertas(ctx, database, variables);

});



bot.on('chosen_inline_result', async (ctx) => {


	try {
		if(ctx.update.chosen_inline_result.result_id === 'solicitar'){
		
			try {
				let user = await database.crearUsuario(ctx.update.chosen_inline_result.from);
				if(user){
					webBotActions.enviarSolicitud(user,bot);
				}
			} catch (error) {
				console.log(error);
			}
      
		}
	} catch (error) {
		console.log(error);
	}
    

});





bot.action(/aceptar_solicitud:(\d+)/, async ctx => {
	
	const [, userId] = ctx.match;
	webBotActions.aceptarSolicitud(userId, ctx);
});
  
  
bot.action(/denegar_solicitud:(\d+)/, ctx => {
	console.log('Denegar');
	const [, userId] = ctx.match;
	console.log(userId);
});

bot.action(/ban_solicitud:(\d+)/, ctx => {
	console.log('Ban');
	const [, userId] = ctx.match;
	console.log(userId);
});

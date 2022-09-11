require('dotenv').config({
	path: './.env'
});

const filtro = require('./accionesBot/Filtro');

const variables = require('./variables');
const errores = require('./errores.js');
const cAdmin = require('./accionesBot/admin'); 
const webBot = require('./webBot/webBot');
const database = require('./webBot/database');
const moders = require('./accionesBot/moders');
const webBotActions = require('./accionesBot/webBotActions');
const inlineActions = require('./accionesBot/inlineActions');
const twitterActions = require('./accionesBot/twitterActions');

const bot = variables.bot;

//Express
//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ');
bot.launch().then(() => {
	console.log('Bot iniciado');
	setInterval(() => {
		console.log('Comprobando Tweets cada 5 minutos');
		twitterActions.comprobarTweets(null,bot,database);
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
twitterActions.twitterCommands(bot, database);
inlineActions.inlineCommands(bot,database);

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

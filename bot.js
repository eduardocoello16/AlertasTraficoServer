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
cAdmin.adminCommands(bot,database);
errores.commands(bot);
moders.modersCommands(bot);
twitterActions.twitterCommands(bot, database);
inlineActions.inlineCommands(bot,database);











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

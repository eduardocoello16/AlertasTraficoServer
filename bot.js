require('dotenv').config({
	path: './.env'
});

const filtro = require('./accionesBot/Filtro');

const variables = require('./variables');
const errores = require('./registroLogs.js');
const cAdmin = require('./accionesBot/admin'); 
const webBot = require('./webBot/webBot');
const database = require('./webBot/database');
const moders = require('./accionesBot/moders');
const webBotActions = require('./accionesBot/webBotActions');
const inlineActions = require('./accionesBot/inlineActions');
const twitterActions = require('./accionesBot/twitterActions');
const alertasUsuario = require('./webBot/alertasUsuario');

const bot = variables.bot;

//Express
//Start bot
//Detectar cuando el bot se conecta
console.log('Iniciando bot... ');
bot.launch().then(() => {
	console.log('Bot iniciado');
	setInterval(() => {
		
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
		nombre = ctx.message.from.first_name;
	}
	ctx.reply(`Hola ${nombre}, este es el  BOT oficial de Alertas de Tráfico TNF`);
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
	webBotActions.aceptarSolicitud(userId, ctx,bot);
});
  
  
bot.action(/denegar_solicitud:(\d+)/, ctx => {
	
	const [, userId] = ctx.match;
	webBotActions.denegarSolicitud(userId, ctx,bot);
});

bot.action(/ban_solicitud:(\d+)/, ctx => {

	const [, userId] = ctx.match;
	webBotActions.banearSolicitud(userId, ctx,bot);
});

bot.action(/pardon_solicitud:(\d+)/, ctx => {

	const [, userId] = ctx.match;
	webBotActions.perdonarSolicitud(userId, ctx,bot);
});



bot.action(/cancelar_alerta:(\d+)/, ctx => {

	const [, userId] = ctx.match;
	alertasUsuario.cancelarAlerta(userId, ctx, bot);
});
bot.action(/aceptar_alerta:(\d+)/, ctx => {

	const [, userId] = ctx.match;
	alertasUsuario.aceptarAlerta(userId, ctx, bot);
});


bot.action(/penalizar_usuario:(\d+)/, async ctx => {

	const [, userId] = ctx.match;
	try {
		await webBotActions.penalizarUsuario(userId, ctx, bot);
	} catch (error) {
		console.log('sadsa');
	}
	
});
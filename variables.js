
const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers);
const grupoAdmins = process.env.BOT_AdminGroup_Test;
const grupoAlertas = process.env.BOT_GroupToSend_Test;
const canalAlertas = process.env.BOT_ChannelToSend_Test;
const mongoDbUri = process.env.MongoDbUri;
const bot_db_name = process.env.BOT_Db_Name;
//Bot
const {
	Telegraf
} = require('telegraf');
const botToken = process.env.BOT_TOKEN_Test;
const bot = new Telegraf(botToken, 
	{
		telegram: {
			testEnv: true
		} 
	});
var enfriamiento = true;
var obtenerTweets = false;
var usuariosPublicaciones = false;



module.exports = {
	usuariosAdmin,
	grupoAdmins,
	grupoAlertas,
	canalAlertas,
	botToken,
	mongoDbUri,
	enfriamiento,
	obtenerTweets,
	usuariosPublicaciones,
	bot_db_name,
	bot
}; 
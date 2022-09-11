
const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers);
const grupoAdmins = process.env.BOT_AdminGroup;
const grupoAlertas = process.env.BOT_GroupToSend;
const canalAlertas = process.env.BOT_ChannelToSend;
const mongoDbUri = process.env.MongoDbUri;
const bot_db_name = process.env.BOT_Db_Name;
//Bot
const {
	Telegraf
} = require('telegraf');
const botToken = process.env.BOT_TOKEN;
const bot = new Telegraf(botToken);
var enfriamiento = true;
module.exports = {
	usuariosAdmin,
	grupoAdmins,
	grupoAlertas,
	canalAlertas,
	botToken,
	mongoDbUri,
	enfriamiento,
	bot,
	bot_db_name
};

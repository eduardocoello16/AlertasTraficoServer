import * as dotenv from 'dotenv'
import { Telegraf } from 'telegraf';
dotenv.config()
const usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers);
const grupoAdmins = process.env.BOT_AdminGroup;
const grupoAlertas = process.env.BOT_GroupToSend;
const canalAlertas = process.env.BOT_ChannelToSend;
const mongoDbUri = process.env.MongoDbUri;
const bot_db_name = process.env.BOT_Db_Name;
//Bot



const botToken = process.env.BOT_TOKEN_Test;
const bot = new Telegraf(botToken, 
	{
		telegram: {
			testEnv: true
		} 
	});
var usuariosPublicaciones = false;
export  {
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

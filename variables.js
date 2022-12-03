import * as dotenv from 'dotenv'
import { Telegraf } from 'telegraf';
dotenv.config()

var usuariosAdmin = JSON.parse(process.env.BOT_AdminUsers);
var grupoAdmins;
var grupoAlertas; 
var canalAlertas;
var mongoDbUri;
var bot_db_name;
var bot;
var botToken;
if(process.env.enviroment === 'produccion'){


 grupoAdmins = process.env.BOT_AdminGroup;
 grupoAlertas = process.env.BOT_GroupToSend;
 canalAlertas = process.env.BOT_ChannelToSend;
 mongoDbUri = process.env.MongoDbUri;
 bot_db_name = process.env.BOT_Db_Name;
//Bot



 botToken = process.env.BOT_TOKEN;
 bot = new Telegraf(botToken);
}else{
	 grupoAdmins = process.env.BOT_AdminGroup_Test;
	 grupoAlertas = process.env.BOT_GroupToSend_Test;
	 canalAlertas = process.env.BOT_ChannelToSend_Test;
	 mongoDbUri = process.env.MongoDbUri;
	 bot_db_name = process.env.BOT_Db_Name;
	//Bot



 botToken = process.env.BOT_TOKEN_Test;
 bot = new Telegraf(botToken, 
	{
		telegram: {
			testEnv: true
		} 
	});
}
var usuariosPublicaciones = false;
export  {
	usuariosAdmin,
	grupoAdmins,
	grupoAlertas,
	canalAlertas,
	botToken,
	mongoDbUri,

	bot,
	bot_db_name
};

import * as variables from '../variables.js';
import * as logs from '../registroLogs.js';
function adminCommands(bot,database){
	
	
	//Comando para obtener lista de comandos para admins
	bot.command('admincommands', async (ctx) => {
		try {
			if(comprobarAdmin(ctx)){
				ctx.reply('---- Comandos para los administradores ----\n\nComandos Tweets\n/obtenertweets - Para obtener los últimos tweets\n \nComandos para el Filtro\n/getwhitelist - Obtener la White List\n/getblacklist - Obtener la Black List\n /getblacklistgroup - Obtener la Black List para el grupo\n/addblacklist - Añade un elemento a la Black List\n/addwhitelist - Añade un elemento a la White List\n/addblacklistgroup - Añade un elemento a la Black List del grupo\n/delblacklist - Borra un elemento a la Black List\n/delwhitelist - Borra un elemento a la White List\n/delblacklistgroup - Borra un elemento a la Black List del grupo\n\nComandos archivo log errores\n/dellog - Borra el fichero .log de errores\n/logs - Obtiene el fichero log de errores y se reenvía por aquí.');
			}else{
				ctx.reply('Necesitas ser admin para ejecutar este comando.');
			}
		} catch (error) {
			logs.botError('Error al enviar admin commands', error);
		}
	});
	


	bot.command('broadcast', (ctx) => {
		
		broadcast(ctx, bot);
	});


	//Comando para llamar a la función obtenerTweets. Ponerle un tiempo de espera de 1 minut para ejecutar el comando 
	bot.command('switchusuarioalerta', async (ctx) => { 
		if(comprobarAdmin(ctx)){

  
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
		if(comprobarAdmin(ctx)){

  
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
}

function comprobarAdmin(ctx) {
   
	let salida = false;
	let id;
	if (ctx.message.chat.type === 'private') {
		id = ctx.message.from.id;
	} else {
		id = ctx.update.message.from.id;
	}

	if (id === null) {
		id = ctx.update.message.from.id;
	}
   
	if (variables.usuariosAdmin.includes(id)) {
		salida = true;
	}

	return salida;
}



function broadcast(ctx, bot){
	try {
		if (comprobarAdmin(ctx)) {
			let mensaje = ctx.message.text;
			mensaje = mensaje.replace('/broadcast', '');
			if (mensaje === '') {
				ctx.reply('Mensaje vacío');
			} else {
				try {
					bot.telegram.sendMessage(variables.grupoAlertas, mensaje);
				} catch (error) {
					ctx.reply('Error interno del bot');
					
				}
			}
		} else {
			ctx.reply('Tienes que ser admin para ejecutar este comando.');
		}
	} catch (error) {
		logs.botError('Error al hacer un broadcast', error);
	}
	
}

async function cambiarPermisos(id, permiso, bot){
	try {
		let user = await bot.telegram.getChatMember(variables.grupoAlertas, id);
		if (user.status === 'left') {
			return false;
		} else {
			//Añadir usuario a la lista de administradores
			
			if(permiso === 'admin'){
				await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {
					can_change_info: true,
					can_delete_messages: true,
					can_manage_chat: true,
					can_invite_users: true,
					can_restrict_members: true,
					can_pin_messages: true,
					can_manage_video_chats: true,
					can_promote_members: true,
					is_anonymous: false
				});
				return true;
			}else if(permiso === 'moder'){
				await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {
					can_change_info: false,
					can_delete_messages: true,
					can_manage_chat: true,
					can_invite_users: true,
					can_restrict_members: true,
					can_pin_messages: false,
					can_manage_video_chats: true,
					can_promote_members: false,
					is_anonymous: false
				});
				return true;
			}else{
				await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {});
				return true;
			}
			
		}
	} catch (error) {
		logs.botError('Error al cambiar los permisos', error);
		return true;
	}
} 


export {
	comprobarAdmin,
	adminCommands,
	cambiarPermisos
	
};
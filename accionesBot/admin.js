const variables = require('../variables');

function adminCommands(bot){
	//Quitar un usuario administrador
	bot.command('deladmin', async (ctx) => {
		deleteAdmin(ctx, bot);
	});
	
	//Comando para obtener lista de comandos para admins
	bot.command('admincommands', async (ctx) => {
		if(comprobarAdmin(ctx)){
			ctx.reply('---- Comandos para los administradores ----\n\nComandos Tweets\n/obtenertweets - Para obtener los últimos tweets\n \nComandos para el Filtro\n/getwhitelist - Obtener la White List\n/getblacklist - Obtener la Black List\n /getblacklistgroup - Obtener la Black List para el grupo\n/addblacklist - Añade un elemento a la Black List\n/addwhitelist - Añade un elemento a la White List\n/addblacklistgroup - Añade un elemento a la Black List del grupo\n/delblacklist - Borra un elemento a la Black List\n/delwhitelist - Borra un elemento a la White List\n/delblacklistgroup - Borra un elemento a la Black List del grupo\n\nComandos archivo log errores\n/delerrorlog - Borra el fichero .log de errores\n/geterrorlog - Obtiene el fichero log de errores y se reenvía por aquí.\n\n Para moderadores \n/modooculto - Para los moderadores del grupo de administradores, puedan ponerse en anónimo en el grupo de alertas.');
		}else{
			ctx.reply('Necesitas ser admin para ejecutar este comando.');
		}
	});
	


	bot.command('broadcast', (ctx) => {
		
		broadcast(ctx, bot);
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

async function deleteAdmin(ctx, bot){
	if (comprobarAdmin(ctx) === true) {
		//Obtener usuario a añadir a la lista de administradores
		let id = ctx.message.text.split(' ')[1];
		//Comprobar que un usuario es anonimo
		try {
			let user = await bot.telegram.getChatMember(variables.grupoAlertas, id);
			if (user.status === 'left') {
				ctx.reply('El usuario no está en el grupo');
			} else {
				//Añadir usuario a la lista de administradores
				try {
					await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {});
					ctx.reply(`Se han actualizado los permisos del usuario ${user.user.first_name} ${user.user.last_name}`);
				} catch (error) {
					console.log(error);
					ctx.reply('Error al añadir usuario');
				}
			}
		} catch (error) {
			console.log(error);
			ctx.reply('Id o nombre inválido');
		}
	} else {
		ctx.reply('No tienes permisos para ejecutar este comando');
	}
}

function broadcast(ctx, bot){
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
}

module.exports = {
	comprobarAdmin,
	adminCommands
	
};
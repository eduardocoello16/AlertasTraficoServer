const variables = require('../variables');
const errores = require('../errores');
async function comprobarGrupoModeradores(ctx, bot){
	let salida = false;
	try {
		let id = ctx.message.from.id;
		let user = await bot.telegram.getChatMember(variables.grupoAdmins, id);
		if(user.status != 'left'){
			salida = true;
		}
	} catch (error) {
		let msg = 'Error al comprobar si el usuario esta en el grupo de moderadores.';
		errores.botError(msg, error);
		ctx.reply('Ha ocurrido un error al cambiar el modo oculto. ¿Eres un moderador asignado por el bot?');
	}
	
   
	return salida;
}

async function modoOculto(ctx, bot){
	if (await comprobarGrupoModeradores(ctx, bot) === true) {
		let id = ctx.message.from.id;
		//Comprobar que un usuario es anonimo
		let user = await bot.telegram.getChatMember(variables.grupoAlertas, id);
       
		try {
			if (user.is_anonymous === true) {
				await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {
					is_anonymous: false,
					can_change_info: user.can_change_info,
					can_delete_messages: user.can_delete_messages,
					can_invite_users: user.can_invite_users,
					can_restrict_members: user.can_restrict_members,
					can_pin_messages: user.can_pin_messages,
					can_promote_members: user.can_promote_members
				});
				ctx.reply(`${ctx.message.from.first_name} ha desactivado el modo oculto `);
			} else {
				await bot.telegram.promoteChatMember(variables.grupoAlertas, id, {
					can_change_info: true,
					can_delete_messages: true,
					can_manage_chat: true,
					can_invite_users: true,
					can_restrict_members: true,
					can_pin_messages: true,
					can_manage_video_chats: true,
					can_promote_members: false,
					is_anonymous: true
				});
				ctx.reply(`${ctx.message.from.first_name} ha activado el modo oculto `);
			}


		} catch (error) {
			let msg = 'Error al cambiar el modo oculto.';
			errores.botError(msg, error);
			ctx.reply('Ha ocurrido un error al cambiar el modo oculto. ¿Eres un administrador asignado por el bot?');
		}
	} else {
		ctx.reply('Comando solo para administradores');
	}
}

module.exports = {
	modoOculto
};
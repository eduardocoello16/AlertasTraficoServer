const database = require('../webBot/database');
const { Markup } = require('telegraf');
const variables = require('../variables');



async function enviarSolicitud(user, bot){
	try {
		if(user){
			let message = `El usuario ${user.first_name} ${user.last_name} solicita permiso para hacer publicaciones en el canal.`;
			bot.telegram.sendMessage(variables.grupoAdmins, message, {
				...Markup.inlineKeyboard([
					[
						Markup.button.callback('Aceptar', `aceptar_solicitud:${user.id}`),
						Markup.button.callback('Denegar', `denegar_solicitud:${user.id}`),
					], 
					[
						Markup.button.callback('Denegar y bloquear', `ban_solicitud:${user.id}`),
					],
					[
						Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
					]
				]
				)
			});
		}
  
	} catch (error) {
		console.log(error);
	}

}

async function aceptarSolicitud(userId, ctx){
	let user = await database.obtenerUsuario(userId);
	let aceptada;
	if(user){
		aceptada = await database.aceptarSolicitud(userId);
	}
	if(aceptada){
		let mensaje = `El usuario ${ctx.update.callback_query.from.first_name} ${ctx.update.callback_query.from.last_name} ha aceptado al usuario ${user.first_name} para que pueda publicar cosas en el canal. `;
		ctx.editMessageText(
			mensaje, {
				...Markup.inlineKeyboard([
					[
						Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
					],
					[
						Markup.button.callback('Banear', `ban_solicitud:${user.id}`)
					]
				]
				)
			}
		);
   
	}
}

module.exports = {
	aceptarSolicitud,
	enviarSolicitud
};
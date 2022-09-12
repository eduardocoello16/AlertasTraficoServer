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
async function denegarSolicitud(userId, ctx,bot){
	let user = await database.obtenerUsuario(userId);
	if(user){
		let denegada = await database.denegarSolicitud(userId);
		if(denegada){
			let mensaje = `El usuario ${ctx.update.callback_query.from.first_name} ${ctx.update.callback_query.from.last_name} ha denegado al usuario ${user.first_name} para que pueda publicar cosas en el canal. `;
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

			bot.telegram.sendMessage(userId, 'Lo sentimos 🤔 parece que han denegado tu solicitud, puedes volver a probar suerte. Te recomendamos que seas miembro del grupo.');
		}
	}
}
async function aceptarSolicitud(userId, ctx,bot){
	//Aceptar la solicitud y editar el mensaje 
	let user = await database.obtenerUsuario(userId);
	
	if(user){
		let	aceptada = await database.aceptarSolicitud(userId);
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

			bot.telegram.sendMessage(userId, 'Enorabuena!🎉🎉 tu solicitud para crear alertas en el canal ha sido aceptada. ');
   
		}else{
			ctx.reply('Ha habído un error, parece que ese usuario no se creó correctamente en la base de datos. 😂');
		}
	}
}
async function banearSolicitud(userId, ctx, bot){
	//Aceptar la solicitud y editar el mensaje 
	let user = await database.obtenerUsuario(userId);
	
	if(user){
		let	aceptada = await database.banearSolicitud(userId);
		if(aceptada){
			let mensaje = `El usuario ${ctx.update.callback_query.from.first_name} ${ctx.update.callback_query.from.last_name} ha baneado al usuario ${user.first_name}`;
			ctx.editMessageText(
				mensaje, {
					...Markup.inlineKeyboard([
						[
							Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
						],
						[
							Markup.button.callback('Perdonar', `pardon_solicitud:${user.id}`)
						]
					]
					)
				}
			);

			bot.telegram.sendMessage(userId, 'Parece que no has hecho algo bien😒. Los administradores han decidido banear tu cuenta de alertas. Ponte en contacto con un admin para solucionarlo.');
   
		}else{
			ctx.reply('Ha habído un error al banear el usuario.');
		}
	}
}
async function perdonarSolicitud(userId, ctx, bot){
	//Aceptar la solicitud y editar el mensaje 
	let user = await database.obtenerUsuario(userId);
	
	if(user){
		let	aceptada = await database.perdonarSolicitud(userId);
		if(aceptada){
			let mensaje = `El usuario ${ctx.update.callback_query.from.first_name} ${ctx.update.callback_query.from.last_name}  perdonado al usuario ${user.first_name} `;
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

			bot.telegram.sendMessage(userId, 'Bienvenido de nuevo! Parece que te han perdonado el baneo. No la cages de nuevo!💩');
   
		}else{
			ctx.reply('Ha habído un error al banear el usuario.');
		}
	}
}
module.exports = {
	aceptarSolicitud,
	denegarSolicitud,
	perdonarSolicitud,
	banearSolicitud,
	enviarSolicitud
};
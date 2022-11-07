import * as database from '../webBot/database.js';
import { Markup } from 'telegraf';
import * as variables from '../variables.js';
import * as logs from '../registroLogs.js';

async function enviarSolicitud(user, bot){
	
	try {
		if(user){
			let id = user.id.toString();
		
			let message = `El usuario ${user.first_name} ${user.last_name} solicita permiso para hacer publicaciones en el canal.`;
			bot.telegram.sendMessage(variables.grupoAdmins, message, {
				...Markup.inlineKeyboard([
					[
						Markup.button.callback('Aceptar', `aceptar_solicitud:${id}`),
						Markup.button.callback('Denegar', `denegar_solicitud:${id}`),
					], 
					[
						Markup.button.callback('Denegar y bloquear', `ban_solicitud:${id}`),
					],
					[
						Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${id}`)
					]
				]
				)
			});
		}
  
	} catch (error) {
		console.log(error)
		logs.botError('Error al enviar solicitud al grupo de administradores', error);
	}

}
async function denegarSolicitud(userId, ctx,bot){
	try {
		
	
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
	} catch (error) {
		logs.botError('Error al denegar solicitud al grupo de administradores', error);
	}
}
async function aceptarSolicitud(userId, ctx,bot){
	try {
		
	
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
	} catch (error) {
		logs.botError('Error al aceptar solicitud al grupo de administradores', error);
	}
}
async function banearSolicitud(userId, ctx, bot){
	try {
		
	
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
	} catch (error) {
		logs.botError('Error al banear   grupo de administradores', error);
	}
}
async function perdonarSolicitud(userId, ctx, bot){
	try {
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
	}catch (error) {
		logs.botError('Error al perdonar solicitud al grupo de administradores', error);
		
	}
}

async function penalizarUsuario(userId, ctx, bot){
	try {
		
	
		//Aceptar la solicitud y editar el mensaje 
		let user = await database.obtenerUsuario(userId);
		let mensajeUser = `Los administradores te han puesto una penalización por una alerta. \nTienes ${user.penalization + 1} penalizaciones.`;
		if((user.penalization + 1) >= 3){
			mensajeUser = `Los administradores te han puesto una penalización por una alerta. \nTienes ${user.penalization + 1} penalizaciones. Por tener más de tres penalizaciones se te pondrá un ban.`;
		}
		if(user){
			let	penalizar = await database.penalizarUsuario(userId);
			if(penalizar){
				bot.telegram.sendMessage(userId, mensajeUser);
				let mensaje = `El usuario ${user.first_name} se le acaba de sumar una penalización por un mensaje.`;
				ctx.editMessageText(
					mensaje, {
						...Markup.inlineKeyboard([
							[
								Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
							]
						]
						)
					}
				);

				
   
			}else{
				ctx.reply('Ha habído un error, parece que ese usuario no se creó correctamente en la base de datos. 😂');
			}
		}
	} catch (error) {
		logs.botError('Error al penalizar un usuario en el  grupo de administradores', error);
	}
}


async function userInGroup(idUsuario,bot){
	try {
		
		let user = await bot.telegram.getChatMember(variables.grupoAlertas, idUsuario);
		
		if(user.status != 'left'){
			return true;
		}else{
			return false;
		}
	} catch (error) {
		logs.botError('Error al comprobar si el usuario está en el grupo de alertas', error);
		return false;
	}	


}
export {
	userInGroup,
	penalizarUsuario,
	aceptarSolicitud,
	denegarSolicitud,
	perdonarSolicitud,
	banearSolicitud,
	enviarSolicitud
};
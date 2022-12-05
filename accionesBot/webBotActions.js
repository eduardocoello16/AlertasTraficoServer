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

//Funciones crear alertas
async function nuevaAlerta(datos, bot){

	//Lo primero comprobar que el usuario no tenga una alerta activa
if(await comprobaralertaactiva(datos.id_usuario) === false){


try {
	let alerta = await database.nuevaAlerta(datos);
	let user = await database.obtenerUsuario(datos.id_usuario);
	if(user && user.status_user === 'active'){
	
		
	
		let mensaje = `Un usuario quiere publicar una alerta:\nNombre: ${user.first_name} \nId del Usuario: ${user.id}\nAlerta: ${datos.alerta}`;
		console.log(alerta._id.toString())
		let envioMensaje =	await bot.telegram.sendMessage(variables.grupoAdmins, mensaje, {
			...Markup.inlineKeyboard([
			
				[
					Markup.button.callback('Aceptar Alerta', `aceptar_alerta:${alerta._id.toString()}`),
					Markup.button.callback('Cancelar envio', `cancelar_alerta:${alerta._id.toString()}`)
				],
				[
					Markup.button.callback('Banear', `ban_solicitud:${user.id}`),
					Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
				]
			]
			)
		});
	
		let datosadminchat = {
			id_adminchat: envioMensaje.chat.id,
			id_mensaje_adminchat: envioMensaje.message_id
		}
		await database.editAlerta(alerta._id.toString(), datosadminchat);
		
		setTimeout(aceptarAlerta, 300000, alerta._id.toString(), bot);
		
		return true;

	
	}else{
		
		return false;
	}	
} catch (error) {
	console.log(error);
	logs.botError('Error  al crear una alerta por un usuario', error);
}

}else{
	return false;
}
}

async function comprobaralertaactiva(idUsuario){
//Comprueba si el usuario tiene una alerta en estado pending.
	let alertasactivas = await database.obtenerAlertasActivas(idUsuario)
	let found = alertasactivas.findIndex((alerta => alerta.estado_alerta === 'pending'))

	if(found === -1){
		return false
	
	}else{
		return true
		
	}
}	

async function aceptarAlerta(idAlerta, mensaje, bot){
	
	try {
	

		const found =await  database.buscarAlerta(idAlerta);
		if(found  && found.estado_alerta === 'pending'){
			await database.editAlerta(found._id.toString(), {estado_alerta: 'activa'})
			let user = await database.obtenerUsuario(found.id_usuario);
			database.sumarPublicacionUser(found.id_usuario);
			

	const iconos = {
		'retenciones' : '🟣',
		'accidente': '🔴',
		'obras': '🟡',
		'viacortada': '🟠',
		'radar': '🔵',
		'otro': '🟤'
	}
	const tipoAlerta = iconos[found.tipo_alerta] || '🟤'
	found.alerta = `${tipoAlerta} ${found.alerta}`;
			await bot.telegram.sendMessage(variables.canalAlertas, found.alerta + "\n\n<em><a href='https://t.me/Alertastnf_bot/'>Enviado mediante BOT</a></em>", {parse_mode: 'HTML', disable_web_page_preview: true});
			await bot.telegram.editMessageText( found.id_adminchat, found.id_mensaje_adminchat, null, `Mensaje de ${user.first_name} ha sido enviado.\nMensaje: ${found.alerta}` );
			await bot.telegram.sendMessage(user.id, '✔ Tu alerta se ha sido aceptada. Muchas Gracias 🙌❤');
			
		}
	} catch (error) {
		logs.botError('Error al aceptar la alerta', error);
		console.log(error)
	}
	
}


async function cancelarAlerta(idAlerta, ctx, bot){
	try {

		const found =await  database.buscarAlerta(idAlerta);
		let user = await database.obtenerUsuario(found.id_usuario);
		await database.editAlerta(found._id.toString(), {estado_alerta: 'denegada'})
		await bot.telegram.editMessageText( found.id_adminchat, found.id_mensaje_adminchat, null, `Un mensaje ha sido eliminado.\nUsuario: ${user.first_name}\nMensaje: ${found.alerta}` );
		await bot.telegram.sendMessage(user.id, '🚫 Los administradores han decidido cancelar el envío de tu alerta.');
	} catch (error) {
		logs.botError('Error al cancelar la alerta', error);
		console.log(error)
	}
}


export {
	nuevaAlerta,
	cancelarAlerta,
	comprobaralertaactiva,
	aceptarAlerta,
	userInGroup,
	penalizarUsuario,
	aceptarSolicitud,
	denegarSolicitud,
	perdonarSolicitud,
	banearSolicitud,
	enviarSolicitud
};
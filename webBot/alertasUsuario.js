const variables = require('../variables');
const { Markup } = require('telegraf');
const database = require('./database');
const logs = require('../registroLogs');
var mensajes = [];

async function nuevoMensaje(datos, bot){
	mensajes.push(datos);
	
	try {
		let user = await database.obtenerUsuario(datos.idUsuario);
		if(user && user.status_user === 'active'){
		
			
		
			let mensaje = `El usuario ${user.first_name} quiere publicar la alerta:\n${datos.alerta}`;
			let envioMensaje =	await bot.telegram.sendMessage(variables.grupoAdmins, mensaje, {
				...Markup.inlineKeyboard([
				
					[
						Markup.button.callback('Aceptar Alerta', `aceptar_alerta:${datos.idUsuario}`),
						Markup.button.callback('Cancelar envio', `cancelar_alerta:${datos.idUsuario}`)
					],
					[
						Markup.button.callback('Banear', `ban_solicitud:${user.id}`),
						Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
					]
				]
				)
			});
		

			
			setTimeout(enviarMensaje, 300000, datos, bot,envioMensaje, user);
			
			return true;
	
		
		}else{
			return false;
		}	
	} catch (error) {
		console.log(error);
		logs.botError('Error  al crear una alerta por un usuario', error);
		const found = mensajes.findIndex(element => element.idUsuario == datos.idUsuario);
		mensajes.splice(found, 1);
	}

}

async function enviarMensaje(datos,bot,mensaje,user){
	//Aquí se enviaría el mensaje al cabo de 5 m
	try {
		const found = mensajes.findIndex(element => element.idUsuario == datos.idUsuario);
		if(found != -1){
			database.sumarPublicacionUser(user.id);
			await bot.telegram.sendMessage(variables.canalAlertas, mensajes[found].alerta + '\n Fuente: Usuario del grupo');
			await bot.telegram.editMessageText( mensaje.chat.id, mensaje.message_id, null, `Mensaje de ${user.first_name} ha sido enviado.\nMensaje: ${datos.alerta}` );
			try {
				await bot.telegram.sendMessage(datos.idUsuario, '✔ Tu alerta se ha publicado en el canal. Muchas Gracias 🙌❤');
			} catch (e) {
				console.log('err');
			}
		
			
			mensajes.splice(found, 1);
			
		}
	} catch (error) {
		console.log(error);
		logs.botError('Error al enviar el mensaje al canal de alertas.');
	}
	
	
	
}

async function cancelarAlerta(id, ctx, bot){
	try {
		const found = mensajes.findIndex(element => element.idUsuario == id);
		if(found != -1){
			let user = await database.obtenerUsuario(id);
		
	
			await ctx.editMessageText(
				`Se ha cancelado el mensaje de  ${user.first_name}:  \n${mensajes[found].alerta }`,{
					...Markup.inlineKeyboard([
				
						[
							Markup.button.callback('Penalizar ', `penalizar_usuario:${id}`),
							Markup.button.callback('Banear', `ban_solicitud:${id}`),
						],
						[
						
							Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
						]
					]
					)
				}
			);
			await bot.telegram.sendMessage(id, '🚫 Los administradores han decidido cancelar el envío de tu alerta.');
			mensajes.splice(found, 1);

		}	
	} catch (error) {
		logs.botError('Error al cancelar la alerta', error);
	}
	
}
async function aceptarAlerta(id, ctx, bot){
	try {
	

		const found = mensajes.findIndex(element => element.idUsuario == id);
		if(found != -1){
			let user = await database.obtenerUsuario(id);
			database.sumarPublicacionUser(id);
			await bot.telegram.sendMessage(variables.canalAlertas, mensajes[found].alerta + '\n Fuente: Usuario del grupo');
			
			await ctx.editMessageText(
				`Se ha aceptado el mensaje de  ${user.first_name}:  \n${mensajes[found].alerta }`,{
					...Markup.inlineKeyboard([
				
						[
							Markup.button.callback('Penalizar ', `penalizar_usuario:${id}`)
						],
						[
						
							Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
						]
					]
					)
				}
			);
			await bot.telegram.sendMessage(id, '✔ Tu alerta se ha publicado en el canal. Muchas Gracias 🙌❤');
			mensajes.splice(found, 1);
		}
	} catch (error) {
		logs.botError('Error al aceptar la alerta', error);
	}
}
module.exports = {
	mensajes,
	aceptarAlerta,
	nuevoMensaje,
	cancelarAlerta
};
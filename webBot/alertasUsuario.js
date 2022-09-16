const variables = require('../variables');
const { Markup } = require('telegraf');
const database = require('./database');
var mensajes = [];

async function nuevoMensaje(datos, bot){
	mensajes.push(datos);
	try {
		let user = await database.obtenerUsuario(datos.idUsuario);
		if(user){
		
		
		
			let mensaje = `El usuario ${user.first_name} quiere publicar la alerta:\n${datos.alerta}`;
			let envioMensaje =	await bot.telegram.sendMessage(variables.grupoAdmins, mensaje, {
				...Markup.inlineKeyboard([
				
					[
						Markup.button.callback('Cancelar envio', `cancelar_alerta:${datos.idUsuario}`)
					]
				]
				)
			});
		
			setTimeout(enviarMensaje, 10000, datos, bot,envioMensaje, user);
			
			return true;
	
		
		}	
	} catch (error) {
		console.log(error);
		const found = mensajes.findIndex(element => element.idUsuario == datos.idUsuario);
		mensajes.splice(found, 1);
	}

}

function enviarMensaje(datos,bot,mensaje,user){
	//Aquí se enviaría el mensaje al cabo de 5 m
	const found = mensajes.findIndex(element => element.idUsuario == datos.idUsuario);

	if(found != -1){

		bot.telegram.sendMessage(variables.canalAlertas, mensajes[found].alerta + '\n Fuente: Usuario del grupo');
		bot.telegram.sendMessage(datos.idUsuario, '✔ Tu alerta se ha publicado en el canal. Muchas Gracias 🙌❤');
		bot.telegram.editMessageText( mensaje.chat.id, mensaje.message_id, null, `Mensaje de ${user.first_name} ha sido enviado.\nMensaje: ${datos.alerta}` );
		mensajes.splice(found, 1);
	}
	
	
}

function cancelarAlerta(id, ctx, bot){

	const found = mensajes.findIndex(element => element.idUsuario == id);
	if(found != -1){
		mensajes.splice(found, 1);
		bot.telegram.sendMessage(id, '🚫 Los administradores han decidido cancelar el envío de tu alerta.');
		ctx.editMessageText(
			'Mensaje cancelado'
		);

	}	
	
}
module.exports = {
	mensajes,
	nuevoMensaje,
	cancelarAlerta
};
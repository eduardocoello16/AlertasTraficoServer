/*const variables = require('../variables');
const webBotActions = require('./webBotActions');
*/
import {userInGroup} from './webBotActions.js';
import * as variables from '../variables.js';
import { Markup } from 'telegraf';
import { nuevoMensaje} from '../webBot/alertasUsuario.js';
function inlineCommands(bot,database){
	
function control(ctx){
	let salida = false;
salida = ((ctx.update.inline_query.chat_type === 'supergroup') ? true : false);
salida = ((ctx.update.inline_query.query.length >  5) ? true : false);
salida = ((ctx.update.inline_query.query.includes(' ')  ) ? true : false);
return salida
}
 
	bot.on('inline_query', async (ctx) => {
	
		let user = ctx.from;
		let idUsuario = ctx.from.id;
		const getUsuario = await database.obtenerUsuario(idUsuario);
		if(control(ctx) === true){

	
		if(getUsuario){
			crearAlertas(ctx, database, variables);
		}else{

			if(await userInGroup(idUsuario, bot)){
				try {
					let nuevoUsuario = await	database.crearUsuario(user);
				nuevoUsuario.status_user = 'active';
				await database.actualizarUsuario(nuevoUsuario);
				crearAlertas(ctx, database, variables);
				} catch (error) {
					console.log(error)
				}
			
			}else{
				ctx.answerInlineQuery([{
					type: 'article',
					id: 'noingroup',
					title: 'Solicita enviar alertas',
					input_message_content: {
						message_text:  'NO se pudo enviar el mensaje, unete el grupo de alertas: https://t.me/alertastraficotnfchat o abre el BOT https://t.me/Alertastnf_bot y solicita permiso. '
					},
					description: 'No puedes enviar alertas, ya que no estás en la base de datos.'
					
				}],);
			}
		}
	}

		
		
	
	});



	bot.on('chosen_inline_result', async (ctx) => {

		

	
		let datos = {
			idUsuario: ctx.update.chosen_inline_result.from.id,
			tipoAlerta: ctx.update.chosen_inline_result.result_id,
			alerta: ctx.update.chosen_inline_result.query
		}
		
		if(await nuevoMensaje(datos,bot)){
			console.log('Enviado')
			try {
				bot.telegram.sendMessage(ctx.update.chosen_inline_result.from.id,'Tu alerta fue enviada a revisión.')
			} catch (error) {
				console.log(error)
			}
		}else{
			
			try {
				bot.telegram.sendMessage(ctx.update.chosen_inline_result.from.id,'Hubo un error al enviar la alerta. ¿Ya estás en proceso de enviar otra alerta?')
			} catch (error) {
				console.log(error);
			}
			
		}
		
    

	});

}


async function crearAlertas(ctx, database, variables){
	let id  = ctx.update.inline_query.from.id;
	let usuario = await  database.obtenerUsuario(id);
	let respuesta = ctx.update.inline_query.query;

	let desactivado = [
        
		{
			type: 'article',
			id: 'alerta_deny',
			title: 'Las alertas están desactivadas',
			input_message_content: {
				message_text: 'Enviar alertas al canal está desactivado.'
			},
			description: 'Ya eres usuario! Pero las alertas están desactivadas actualmente.'
            
		}
    
	];


	
	let results = [
		{
			type: 'article',
			id: 'Radar',
			title: 'Radar',
			input_message_content: {
				message_text: 'La alerta: ' +respuesta + '. \n se enviará al canal.' 
			},
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'Accidente',
			title: 'Accidente',
			input_message_content: {
				message_text: 'La alerta: ' + respuesta + ' se enviará al canal.'
			},
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'Retenciones',
			title: 'Retenciones',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n se enviará al canal.`
			},
			description: 'Envía una nueva alerta al canal.'
		},
		{
			type: 'article',
			id: 'Obra',
			title: 'Obra',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n  se enviará al canal.`
			},
			description: 'Envía una nueva alerta al canal.'
		}
	];
	
	try {
		let servicioactivo = await database.getBotData(variables.bot_db_name);
					if(servicioactivo.usuariosPublicaciones){

						ctx.answerInlineQuery(results);
					}else{
						ctx.answerInlineQuery(desactivado);
					}
  
	
	} catch (error) {
		console.log(error);
	}

}
export  {
	inlineCommands
};
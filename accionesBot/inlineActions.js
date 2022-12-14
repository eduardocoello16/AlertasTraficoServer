/*const variables = require('../variables');
const webBotActions = require('./webBotActions');
*/
import {userInGroup} from './webBotActions.js';
import * as variables from '../variables.js';
import { Markup } from 'telegraf';
import * as webBotAction from './webBotActions.js';
function inlineCommands(bot,database){
	
function control(ctx){
	let salida = false;
salida = ((ctx.update.inline_query.query.length >  5) ? true : false);
salida = ((ctx.update.inline_query.chat_type === 'supergroup') ? true : false);
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
			id_usuario: ctx.update.chosen_inline_result.from.id,
			tipo_alerta: ctx.update.chosen_inline_result.result_id,
			alerta: ctx.update.chosen_inline_result.query
		}
		
		if(await webBotAction.nuevaAlerta(datos,bot)){
			console.log('Enviado')
			try {
				await bot.telegram.sendMessage(ctx.update.chosen_inline_result.from.id,'Tu alerta fue enviada a revisión, si en 5m no la aceptan se enviará automaticamente.')
			} catch (error) {
				console.log(error)
			}
		}else{
			
			try {
				await bot.telegram.sendMessage(ctx.update.chosen_inline_result.from.id,'Hubo un error al enviar la alerta. ¿Ya estás en proceso de enviar otra alerta?')
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
			id: 'radar',
			title: 'Radar',
			input_message_content: {
				message_text: 'La alerta: ' +respuesta + '. \n se enviará al canal.' 
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/radarfoto.png',
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'accidente',
			title: 'Accidente',
			input_message_content: {
				message_text: 'La alerta: ' + respuesta + ' se enviará al canal.'
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/accidentefoto.png',
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'retenciones',
			title: 'Retenciones',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n se enviará al canal.`
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/retencionesfoto.png',
			description: 'Envía una nueva alerta al canal.'
		},
		{
			type: 'article',
			id: 'obras',
			title: 'Obra',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n  se enviará al canal.`
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/obrasfoto.png',
			description: 'Envía una nueva alerta al canal.'
		},
		{
			type: 'article',
			id: 'otro',
			title: 'Otro',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n  se enviará al canal.`
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/otrofoto.png',
			description: 'Envía una nueva alerta al canal.'
		},
		{
			type: 'article',
			id: 'viacortada',
			title: 'Vía Cortada',
			input_message_content: {
				message_text:   `La alerta: ${respuesta}\n  se enviará al canal.`
			},
			thumb_url: 'https://alertastraficotnfbot.netlify.app/viacortadafoto.png',
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
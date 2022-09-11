
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

	let solicitar_deny = [
		//Se deniega ya que el tiempo es inválido
		{
			type: 'article',
			id: 'solicitar_deny',
			title: 'Solicitar enviar alertas',
			input_message_content: {
				message_text: 'Para hacer otra solicitud tendrás que esperar hasta un maximo de 24h.'
			},
			description: 'Parece que tendrás que esperar 24h'
            
		}
    
	];
	let solicitar = [
        
		{
			type: 'article',
			id: 'solicitar',
			title: 'Solicitar enviar alertas',
			input_message_content: {
				message_text: 'Se ha enviado  tu solicitud'
			},
			description: 'Para enviar alertas necesita que un admin te valide.'
                
		}
        
	];
	let results = [
		{
			type: 'article',
			id: 'Radar',
			title: 'Radar',
			input_message_content: {
				message_text: respuesta + '. \n Fue enviado al canal.' 
			},
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'Accidente',
			title: 'Accidente',
			input_message_content: {
				message_text: respuesta + ' se ha envíado'
			},
			description: 'Envía una nueva alerta al canal.'
            
		},
		{
			type: 'article',
			id: 'Retenciones',
			title: 'Retenciones',
			input_message_content: {
				message_text:   `${respuesta}\n  Este mensaje fue enviado al canal.`
			},
			description: 'Envía una nueva alerta al canal.'
		},
		{
			type: 'article',
			id: 'Obra',
			title: 'Obra',
			input_message_content: {
				message_text:   `${respuesta}\n  Este mensaje fue enviado al canal.`
			},
			description: 'Envía una nueva alerta al canal.',
			reply_markup:{
				keyboards: [
					[
						{
							text: 'Enviar', callback_data: 'enviar'
						}
					]
				]
			}
		}
	];
	try {
		if(usuario){
			if(usuario.status_user === 'pending'){
				let fecha = new Date(usuario.Date_request);
				let fechahoy = new Date();
				let milisegundosDia  = 24*60*60*1000;
				let milisegundostranscurridos = Math.abs(fecha.getTime() - fechahoy.getTime());
				let diatransc = Math.round(milisegundostranscurridos/milisegundosDia);
				if(diatransc === 0){
         
					ctx.answerInlineQuery(solicitar_deny);
				}else{
        
					ctx.answerInlineQuery(solicitar);
					database.actualizarFechaCreation(usuario);
				}
			}else{
				if(usuario.status_user === 'active'){
					let servicioactivo = await database.getBotData(variables.bot_db_name);
					if(servicioactivo.usuariosPublicaciones){

						ctx.answerInlineQuery(results);
					}else{
						ctx.answerInlineQuery(desactivado);
					}
           
				}
			}
		}else{
			ctx.answerInlineQuery(solicitar);
		}
  
	
	} catch (error) {
		console.log(error);
	}

}

module.exports = {
	crearAlertas
};
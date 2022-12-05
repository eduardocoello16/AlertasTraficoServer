import * as variables from '../variables.js';
import * as filtro from './Filtro.js';
import * as logs from '../registroLogs.js';
import { ETwitterStreamEvent, TweetStream, TwitterApi, ETwitterApiError } from 'twitter-api-v2';


//Variables usuarios
const grupoAdmins = variables.grupoAdmins;
const grupoAlertas = variables.grupoAlertas;
const canalAlertas = variables.canalAlertas;

//Funciónes Obtener tweets
async function obtenerTweets(bot, database){
	
	try {
		const client = new TwitterApi(process.env.Twitter_token);
	let cuentas = JSON.parse(process.env.Twitter_Accounts);
		const stream = await client.v2.searchStream();
	
	await client.v2.updateStreamRules({
		add: cuentas
	});
	
	
	// Assign yor event handlers
	// Emitted on Tweet
	
	

	// Start stream!
	await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });

	stream.on(ETwitterStreamEvent.Data, (data) => filtrado(data));
	} catch (error) {
		console.log('No cargó correctamente la obtención de tweets')
		
		logs.botError('Error al cargar la obtención de tweets', error);
	}
		async function filtrado(data){
			
			let cuenta = data.matching_rules[0].tag;
		let tweet = data.data;
	//Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
	
		//Filtrar Tweet
		if (await filtro.filtradoAcceso(tweet) === true) {
			if (await filtro.filtradoBlackListGroup(tweet) === true) {
				try {
                    
					enviarMensaje(tweet, grupoAlertas,bot, cuenta);
				} catch (error) {
					console.log(error);
				}
			} else {
				try {
					enviarMensaje(tweet, canalAlertas,bot, cuenta);
				} catch (error) {
					console.log(error);
				}
			}

		}
		}

	


	




async function enviarMensaje(tweet, destinatario,bot, cuenta) {
	
	//Enviar tweet al grupo
	try {
		
	
			
		
		bot.telegram.sendMessage(destinatario, `${tweet.text}\n\n<a href="https://twitter.com/${cuenta}/status/${tweet.id}"> <em>Cuenta Twitter de ${cuenta}</em> </a>`,
			//Send message without url preview
			{
				disable_web_page_preview: true,
				parse_mode: 'HTML'
			
			});
	} catch (error) {
		console.log(error);
	}
	//Mensaje sin sonido = disable_notification: true
}

}




export  {
	obtenerTweets
}
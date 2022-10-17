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
	stream.on(ETwitterStreamEvent.Data, (data) => filtrado(data.data));
	

	// Start stream!
	await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
	} catch (error) {
		logs.botError('Error al cargar la obtención de tweets', error);
	}
		async function filtrado(tweet){
		
	//Comprobar si el tweet ya se ha guardado en los logs (Si ha sido enviado o descartado anteriormente)
	
		//Filtrar Tweet
		if (await filtro.filtradoAcceso(tweet) === true) {
			if (await filtro.filtradoBlackListGroup(tweet) === true) {
				try {
                    
					enviarMensaje(tweet, grupoAlertas,bot);
				} catch (error) {
					console.log(error);
				}
			} else {
				try {
					enviarMensaje(tweet, canalAlertas,bot);
				} catch (error) {
					console.log(error);
				}
			}

		}
		}

	


	




function enviarMensaje(tweet, destinatario,bot) {
	
	//Enviar tweet al grupo
	try {
		bot.telegram.sendMessage(destinatario, `${tweet.text}\nCuenta Twitter`,
			//Send message without url preview
			{
				disable_web_page_preview: true
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
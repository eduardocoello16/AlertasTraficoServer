const HmacSHA256 = require('crypto-js/hmac-sha256');
const Hex = require('crypto-js/enc-hex');
var express = require('express');
var app = express();
var bp = require('body-parser');
const variables = require('../variables');
const cors = require('cors');
const database = require('./database');
const { Markup } = require('telegraf');

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());
app.listen(2000, () =>{
	console.log('Servidor levantado correctamente en  http://localhost:' + 2000 );
});

function comprobarHash(WebAppData, hash){
   
	const q = new URLSearchParams(WebAppData);
	q.delete('hash');
	const v = Array.from(q.entries());
	// eslint-disable-next-line no-unused-vars
	v.sort(([aN, aV], [bN, bV]) => aN.localeCompare(bN));
	const data_check_string = v.map(([n, v]) => `${n}=${v}`).join('\n');
	var secret_key = HmacSHA256(variables.botToken, 'WebAppData');
	var key = HmacSHA256(data_check_string, secret_key).toString(Hex);
	var salida = false;
	if(hash == key){
		salida = true;
		console.log('Correcto');
        
	}

	return salida;
}

function rutas(bot){



	app.post('/nuevoUsuario', async function(req, res){
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;

		if(comprobarHash(WebAppData, hash)){
			const getUsuario = await database.obtenerUsuario(req.body.userData.id);
			if(getUsuario){
				//Solo se podrá enviar la solicitud si ha pasado un día.
				if(getUsuario.Date_request){
					let fecha = new Date(getUsuario.Date_request);
					let fechahoy = new Date();
					let milisegundosDia  = 24*60*60*1000;
					let milisegundostranscurridos = Math.abs(fecha.getTime() - fechahoy.getTime());
					let diatransc = Math.round(milisegundostranscurridos/milisegundosDia);
					if(diatransc != 0){
						database.actualizarFechaCreation(getUsuario);
						enviarSolicitud(getUsuario, bot);
						res.status(200).send(
							{
								'msg': 'Tu solicitud se ha vuelto a enviar. Si no se le acepta la solicitud, recomendamos unirse al canal. '
							}
						);
					}else{
						res.status(200).send(
							{
								'msg': 'Tienes que esperar 24h minimo para volver a solicitar.'
							}
						);
					}
       
        
				}else{
					res.status(200).send({
						'msg': 'El usuario ya existía, por favor, espera 1 día'
					});
				}
      
			}else{
				let user = await database.crearUsuario(req.body.userData);
				if(user){
					res.status(200).send({
						'msg': 'Se ha enviado una solicitud a los administradores.'
					});
					enviarSolicitud(user, bot);
				}else{
					res.status(500).send({
						'msg': 'Error en el servidor.'
					});
				}
      
			}
		}else{
			res.status(500).send(
				{
					'msg': 'El hash no es correcto.'
				}
			);
		}
	});




	//Comprobar si el usuario está en el grupo
	app.post('/comprobarusuario', async function(req, res) {
		console.log('Comprobando usuario' );
		let id = req.body.id;
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		let state = await database.getBotData(variables.bot_db_name);
		if(comprobarHash(WebAppData, hash)){
			try {
				const getUsuario = await database.obtenerUsuario(id);
				console.log(getUsuario);
				res.status(200).send( {
					user: getUsuario,
					web_status: state.usuariosPublicaciones
				});
        
        
			} catch (error) {
        
				console.log(error);
				res.status(500).send({
					'msg': 'Error en el servidor'
				});
			}
    
		}
		else{
			res.status(500).send({
				'msg': 'El hash del bot no es válido.'
			});
		}
	});



 

}



async function enviarSolicitud(user, bot){
	console.log('enviando mensaje');
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


function aceptarUsuario(){
	console.log('Aceptado');
}

module.exports = {
	rutas,
	aceptarUsuario
};
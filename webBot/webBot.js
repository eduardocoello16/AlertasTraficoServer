const HmacSHA256 = require('crypto-js/hmac-sha256');
const Hex = require('crypto-js/enc-hex');
var express = require('express');
var app = express();
var bp = require('body-parser');
const variables = require('../variables');
const cors = require('cors');
const webBotAction = require('../accionesBot/webBotActions');
const alertasUsuario = require('./alertasUsuario');
const moders = require('../accionesBot/moders');
const cAdmin = require('../accionesBot/admin');
const logs = require('../registroLogs');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());
app.listen(2000, () =>{
	console.log('Servidor levantado correctamente en  http://127.0.1:' + 2000 );
});
function comprobarHash(WebAppData){
   
	const q = new URLSearchParams(WebAppData);
	let hash = q.get('hash');
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
		
        
	}

	return salida;
}
function rutas(bot, database){

	app.post('/comprobarusuarioanonimo' , async function(req, res){
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		let idUsuario = req.body.idUsuario;

		if(comprobarHash(WebAppData, hash)){
			if(await moders.comrpobaranonimo(bot, idUsuario)){

				
				res.status(200).send(true);
			}else{
				res.status(200).send(false);
			}
		}else{
			
			res.status(200).send(false);
		}
	});

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
						webBotAction.enviarSolicitud(getUsuario, bot);
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
					webBotAction.enviarSolicitud(user, bot);
				}else{
					res.status(500).send({
						'msg': 'Error en el servidor.'
					});
				}
      
			}
		}else{
			logs.botError('Error al crear usuario', 'Error al comprobar el hash');
			res.status(500).send(
				{
					'msg': 'El hash no es correcto.'
				}
			);
		}
	});
	//Comprobar si el usuario está en el grupo
	app.post('/comprobarusuario', async function(req, res) {
		logs.botLog(req.body.userData.first_name + ' entró en webapp');
		let id = req.body.id;
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		let state = await database.getBotData(variables.bot_db_name);
		if(comprobarHash(WebAppData, hash)){
			try {
				const getUsuario = await database.obtenerUsuario(id);
				if(getUsuario){
					await database.actualizarUsuario(req.body.userData);
				}
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
	app.post('/publicaralerta', async function(req, res) {
	
		
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		let state = await database.getBotData(variables.bot_db_name);
		const found = alertasUsuario.mensajes.findIndex(element => element.idUsuario == req.body.datosAlerta.idUsuario);
		if(comprobarHash(WebAppData, hash)){
			if(state.usuariosPublicaciones){
				
				if(found === -1){
					
					if(await alertasUsuario.nuevoMensaje(req.body.datosAlerta,bot)){
						res.status(200).send(
							{
								'msg': 'Enviadno...'
							}
						);
					}else{
						res.status(400).send(
							{
								'msg': 'Error en el servidor'
							}
						);
					}
					
				}else{
					console.log('mensaje enviado ya...');
					res.status(200).send(
						{
							'msg': 'Ya tienes un  mensaje pendiente.'
						}
					);
				}

			}else{
				res.status(400).send({
					'msg': 'Las alertas están desactivadas.'
				});
			}
    
		}
		else{
			res.status(500).send({
				'msg': 'El hash del bot no es válido.'
			});
		}
	});

	app.post('/comprobaralertaactiva', async function(req, res) {
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		let state = await database.getBotData(variables.bot_db_name);
		if(comprobarHash(WebAppData, hash)){
			if(state.usuariosPublicaciones){
				
				const found = alertasUsuario.mensajes.findIndex(element => element.idUsuario == req.body.idUsuario);
				if(found != -1){
					res.status(200).send(true);
				}else{
					res.status(200).send(false);
				}

			}else{
				res.status(400).send({
					'msg': 'Las alertas están desactivadas.'
				});
			}
    
		}
		else{
			res.status(500).send({
				'msg': 'El hash del bot no es válido.'
			});
		}
	});


	app.post('/listausuarios', async function(req, res) {
		
	
		let hash = req.body.hash;
		let WebAppData = req.body.WebAppData;
		if(comprobarHash(WebAppData, hash)){
			let listausuarios = await database.getListaUsuarios();
			res.status(200).send(listausuarios);
		}
	});

	app.post('/cambiarpermisos', async function(req, res) {
		let WebAppData = req.body.WebAppData;
		let idUsuario = req.body.idUsuarioCpermisos;
		let permisos = req.body.permisos;
		if(comprobarHash(WebAppData)){
			if(await comprobarAdmin(WebAppData)){
				let usuario = await database.obtenerUsuario(idUsuario);
				if(usuario.type_user != permisos){
					
					usuario.type_user = permisos;
					await database.actualizarUsuario(usuario);
					await cAdmin.cambiarPermisos(usuario.id, permisos, bot);
					res.status(200).send(usuario);
				}
			}
		}
	});
	app.post('/cambiarmodooculto', async function(req,res){
		let WebAppData = req.body.WebAppData;
		if(comprobarHash(WebAppData)){
			const q = new URLSearchParams(WebAppData);
			let modUser = JSON.parse(q.get('user'));
			let usuario = await database.obtenerUsuario(modUser.id);
			if(usuario.type_user === 'moder' || usuario.type_user ==='admin'){
				try {
					let modoOculto = await moders.modoOculto(modUser.id, bot);
					res.status(200).send(modoOculto);
				} catch (error) {
					console.log(error);
				}
				
			}	
		}
	});


	async function comprobarAdmin(WebAppData){
		const q = new URLSearchParams(WebAppData);
		let adminUser = JSON.parse(q.get('user'));
		
		let usuario = await database.obtenerUsuario(adminUser.id);
		if(usuario.type_user === 'admin'){
		
			return true;
		}else{
			return false;
		}
	}
	const axios = require('axios');

	app.post('/obtenerimagen', async function(req,res){
		
		let url = req.body.url; 
	

		try {
			const arrayBuffer = await axios.get(url, {
				responseType: 'arraybuffer'
			});
			let buffer = Buffer.from(arrayBuffer.data,'binary').toString('base64');
			let image = `data:${arrayBuffer.headers['content-type']};base64,${buffer}`;
			res.send(image);
		
		}catch(error){
			console.log(error);
		}
	});
	const fs = require('fs');
	app.get('/obtenercamaras', async function(req,res){
		let camaras = fs.readFileSync('./camarasTrafico.json', 'utf-8');
		res.status(200).send(camaras);
	});

}










module.exports = {
	rutas
};
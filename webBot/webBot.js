
import  HmacSha256 from 'crypto-js/hmac-sha256.js';
import  Hex from 'crypto-js/enc-hex.js';
import  express from 'express';
import  fs from 'fs';
import  bp from 'body-parser';
import * as variables from '../variables.js';
import  cors from 'cors';
import * as webBotAction from '../accionesBot/webBotActions.js';
import * as moders from '../accionesBot/moders.js'
import * as cAdmin from '../accionesBot/admin.js'; 
import * as logs from '../registroLogs.js';
import { obtenerUsuario } from './database.js';
import axios  from 'axios';
//const { obtenerUsuario } = require('./database');
var app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());
let port = process.env.PORT || 3000;
app.listen(port, () =>{
	console.log('Servidor levantado correctamente en  http://127.0.1:' + port );
});
function comprobarHash(WebAppData){
   
	const q = new URLSearchParams(WebAppData);
	let hash = q.get('hash');
	q.delete('hash');
	const v = Array.from(q.entries());
	// eslint-disable-next-line no-unused-vars
	v.sort(([aN, aV], [bN, bV]) => aN.localeCompare(bN));
	const data_check_string = v.map(([n, v]) => `${n}=${v}`).join('\n');
	var secret_key = HmacSha256(variables.botToken, 'WebAppData');
	var key = HmacSha256(data_check_string, secret_key).toString(Hex);
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
						await database.actualizarFechaCreation(getUsuario);
						await webBotAction.enviarSolicitud(getUsuario, bot);
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
				
				await webBotAction.enviarSolicitud(user, bot);
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
		
		
	
		let WebAppData = req.body.WebAppData;
		const q = new URLSearchParams(WebAppData);
		let user = JSON.parse(q.get('user'));
		logs.botLog(user.first_name + ' entró en webapp');
		
		let state = await database.getBotData(variables.bot_db_name);
		if(comprobarHash(WebAppData)){
			try {
				const getUsuario = await database.obtenerUsuario(user.id);
				if(getUsuario){
					await database.actualizarUsuario(user);
					res.status(200).send( {
						user: getUsuario,
						web_status: state.usuariosPublicaciones
					});
					
				}else{
					
					if(await webBotAction.userInGroup(user.id, bot)){
						try {
							let nuevoUsuario = await	database.crearUsuario(user);
							nuevoUsuario.status_user = 'active';
							await database.actualizarUsuario(nuevoUsuario);
							let usuario = await obtenerUsuario(nuevoUsuario.id);
						
							res.status(200).send( {
								user: usuario,
								web_status: state.usuariosPublicaciones
							});
						} catch (error) {
							logs.botError('Error al crear usuario(Ya que está en el grupo)', error);
							res.status(500).send({
								'msg': 'error al crear el usuario'
							});
						}
						
					}else{
						res.status(200).send( {
							user: getUsuario,
							web_status: state.usuariosPublicaciones
						});
					}
				}
			
        
        
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
		if(comprobarHash(WebAppData, hash)){
			try {
				if(state.usuariosPublicaciones){
					if(await webBotAction.nuevaAlerta(req.body.datosAlerta,bot)){
							res.status(200).send(
								{
									'msg': 'Enviando...'
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
					res.status(400).send({
						'msg': 'Las alertas están desactivadas.'
					});
				}
			} catch (error) {
				console.log(error);
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
				
				
				const found = await webBotAction.comprobaralertaactiva(req.body.idUsuario)
				if(found === true){
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

	
	app.post('/enviarimagen', async function(req, res) {
		
	
		let WebAppData = req.body.WebAppData;
		let camara = req.body.camara;
		const q = new URLSearchParams(req.body.WebAppData);
		let query_id = q.get('query_id');
	
		if(comprobarHash(WebAppData)){
			let ruta = 'camarasTrafico.json';
			let fichero = fs.readFileSync(ruta, 'utf-8');
			fichero = JSON.parse(fichero);
			let encontrado = fichero.findIndex((searchcamara) => searchcamara.id == camara);
			
			if(encontrado != -1 ){
				
				let fecha = new Date();
				
				let urldia = `?d=${fecha.getTime()}{NoCacheParam}`;
				console.log(urldia);
				
				await bot.telegram.answerWebAppQuery(query_id,
					{
						cache_time: 0,
						type: 'photo',
						id: 'enviadno',
						title: 'LOG',
						photo_url: fichero[encontrado].url + urldia,
						thumb_url: fichero[encontrado].url + urldia,
					});
			}
			res.status(200).send('');
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
			console.log('Error al cargar una imagen (Para más detalle ir al .log)');
			logs.botError('Error al cargar una imagen' + error);
		}
	});
	app.post('/obtenerficherolog', async function(req,res){

		if( comprobarHash(req.body.WebAppData)){
			try {
			
			
				const q = new URLSearchParams(req.body.WebAppData);
				let query_id = q.get('query_id');
				
				let idUsuario = JSON.parse(q.get('user')).id;
		
				let user = await database.obtenerUsuario(idUsuario);
			
				if( user.type_user == 'admin'){

				
					await bot.telegram.answerWebAppQuery(query_id, 
						{
							type: 'article',
							id: 'enviadno',
							title: 'LOG',
							message_text: `Solicitado envío ${req.body.fichero}.log`
						});
					await bot.telegram.sendDocument(req.body.idUsuario, {source: `${req.body.fichero}.log`});
				}
			
			}catch(error){
				console.log(error);
				res.status(500).send(
					{
						'msg': 'Error en el servidor'
					}
				);
			}
		}

	
	});


	app.get('/obtenercamaras', async function(req,res){
		let camaras = fs.readFileSync('./camarasTrafico.json', 'utf-8');
		res.status(200).send(camaras);
	});


	app.post('/obteneralertas', async function(req,res){

		if( comprobarHash(req.body.WebAppData)){
			try {
				let alertas = await database.obteneralertas()
				let fechahoy = new Date();
				let milisegundosDia  = 12*60*60*1000;
				alertas = alertas.filter((alerta) => {
					let fecha = new Date(alerta.fecha_creacion);
					let milisegundostranscurridos = Math.abs(fecha.getTime() - fechahoy.getTime());

					let diatransc = Math.round(milisegundostranscurridos/milisegundosDia);
					if(milisegundosDia > milisegundostranscurridos){ 
						return alerta
					}
				})
				
		
			
				res.status(200).send(alertas)
				
				
			
			
			}catch(error){
				console.log(error);
				res.status(500).send(
					{
						'msg': 'Error en el servidor'
					}
				);
			}
		}

	
	});


	

}









export  {
	rutas
};
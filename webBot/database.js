//Base de datos 
import mongoose from 'mongoose';
import usuarioModel from './models/user.js';
import * as variables from '../variables.js';
import botinfo from './models/botinfo.js';


mongoose.connect(variables.mongoDbUri)
	.then(() => console.log('Conexión base datos satisfactoria.'))
	.catch((error) => console.error(error));





/*
crearBot();
async function crearBot(){
	let datos = {
		id: 'bot_alertas_tenerife_test',
		name: 'Bot Alertas Tráfico TNF',
		obtenerTweets: true,
		usuariosPublicaciones: false,
		whiteList: ['accidente','tráfico','Icod','colisión','#TRÁFICOSC','TF','carretera','carreteras','circular','calle','coche','señal','vehículos','TF-1','TF-5','guaguas','radar','radares','atropello','#Radar','#AtestadosSC','vehículo','#carreteras','turismo','motorista','colicionar','vehículo.','semáforos'],
		blackList :['GC','ElHierro','LPGC','Lapalma','Fuerteventura','Lanzarote','#LaPalma','lapalma','#LaGomera','lagomera','#LasPalmas','#Fuerteventura','#Lanzarote','#Elhierro','Gomera','Palmas','#Fuerteventura','#Fuerteventura.','Agaete','GC-200','#Grancanaria'],
		blackListGroup :['agradecer','anoche','plazo','meses','euros','inversión','licita','licitación','pasado','semana','mes','año','asistió','atropelló','intervino','pasada','densidad','aprobado','anoche']
	};
	let nuevoBot = await botinfo(datos);
	console.log('Bot creado');
	nuevoBot.save();
}
*/


async function obtenerUsuario(idUsuario){
	return await usuarioModel.findOne({id: idUsuario});
}

async function crearUsuario(userData){
	if(await usuarioModel.findOne({id: userData.id})){
		return null;
	}else{
		let user = await usuarioModel(userData);
		try {
           
			return await user.save();
           
		} catch (error) {
           
			console.log(error);
		}   
	}
    
}

async function actualizarFechaCreation(user){
	user.Date_creation = new Date();
   
	try {
		user.save();
	} catch (error) {
		console.log(error);
		return null;
	}
}





async function getBotData(botid){
 
	let obtenerBot = await botinfo.findOne({id: botid});
	return obtenerBot;
}

async function saveBotData(bot){
	try {
		await bot.save();
	} catch (error) {
       
		console.log(error);
	}
}


async function save_obtenerTweets_state(state){
	try {
		const modificar = await botinfo.findByIdAndUpdate(state._id, state);
		modificar.save();
	} catch (error) {
		console.log(error);
	}
}


async function aceptarSolicitud(userId){
	const user = await obtenerUsuario(userId);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, {
			status_user: 'active'
		});
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}

}
async function denegarSolicitud(userId){
	const user = await obtenerUsuario(userId);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, {
			status_user: 'deny'
		});
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
}
async function banearSolicitud(userId){
	const user = await obtenerUsuario(userId);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, {
			status_user: 'banned'
		});
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
        
	
}
async function perdonarSolicitud(userId){
	const user = await obtenerUsuario(userId);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, {
			status_user: 'active'
		});
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function getListaUsuarios(){
	try {
		let listaUsuarios = await usuarioModel.find().sort({
			num_alertas: -1
		});
	
		return listaUsuarios;
	} catch (error) {
		console.log(error);
	}
}

async function actualizarUsuario(usuario){
	
	const user = await obtenerUsuario(usuario.id);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, usuario);
		
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function sumarPublicacionUser(id){

	
	const user = await obtenerUsuario(id);
	
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, {
			num_alertas: (user.num_alertas +  1)
		});
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
}
async function penalizarUsuario(userId){
	const user = await obtenerUsuario(userId);
	
	let data;
	if ((user.penalization + 1) >= 3 ){
		console.log('addas');
		data = {
			penalization: (user.penalization + 1),
			status_user: 'banned'
		};
	}else{
	
		data = {
			penalization: (user.penalization + 1)
		};
	}
	console.log(data);
	try {
		const modificar = await usuarioModel.findByIdAndUpdate(user._id, data);
		modificar.save();
		return true;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export {
	penalizarUsuario,
	sumarPublicacionUser,
	actualizarUsuario,
	getListaUsuarios,
	aceptarSolicitud,
	denegarSolicitud,
	perdonarSolicitud,
	banearSolicitud,
	save_obtenerTweets_state,
	obtenerUsuario,
	crearUsuario,
	actualizarFechaCreation,
	getBotData,
	saveBotData
};
//Base de datos 
const mongoose = require('mongoose');
const usuarioModel = require('./models/user');
const variables = require('../variables');
const botinfo = require('./models/botinfo');

mongoose.connect(variables.mongoDbUri)
	.then(() => console.log('Conexión base datos satisfactoria.'))
	.catch((error) => console.error(error));

//Configurando las variables por defecto en base a la Base de datos. 
botinfo.findOne({id: variables.bot_db_name})
	.then((bot) => {
		if(bot){
			variables.obtenerTweets = bot.obtenerTweets;
			variables.usuariosPublicaciones = bot.usuariosPublicaciones;
		}
	})
	.catch(() => console.log('No se pudieron obtener las variables de la base de datos.'));



/*
 crearBot()
async function crearBot(){
	let datos = {
		id: 'bot_alertas_tenerife',
		name: 'Bot Alertas Tráfico TNF',
		obtenerTweets: true,
		usuariosPublicaciones: false,
		whiteList: ['accidente','tráfico','Icod','colisión','#TRÁFICOSC','TF','carretera','carreteras','circular','calle','coche','señal','vehículos','TF-1','TF-5','guaguas','radar','radares','atropello','#Radar','#AtestadosSC','vehículo','#carreteras','turismo','motorista','colicionar','vehículo.','semáforos'],
		blackList :['GC','ElHierro','LPGC','Lapalma','Fuerteventura','Lanzarote','#LaPalma','lapalma','#LaGomera','lagomera','#LasPalmas','#Fuerteventura','#Lanzarote','#Elhierro','Gomera','Palmas','#Fuerteventura','#Fuerteventura.','Agaete','GC-200','#Grancanaria'],
		blackListGroup :['agradecer','anoche','plazo','meses','euros','inversión','licita','licitación','pasado','semana','mes','año','asistió','atropelló','intervino','pasada','densidad','aprobado','anoche']
	};
	let nuevoBot = await botinfo(datos);
	console.log(nuevoBot);
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
		await state.save();
        
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
	let user = await obtenerUsuario(userId);
	if(user){
		user.status_user = 'active';
		try {
			user.save();
			return true;
		} catch (error) {
			console.log(error);
			return null;
		}
        
	}else{
		return null;
	}
}

module.exports = {
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
const fs = require('fs');
const cAdmin = require('./accionesBot/admin');

function commands(bot){
	bot.command('dellogs', (ctx) => {
		borrarFichero('registro',ctx);
	});
	bot.command('logs', (ctx) => {
		obtenerFichero('registro',ctx);
	});
	bot.command('delerrorlogs', (ctx) => {
		borrarFichero('errores',ctx);
	});
	bot.command('errorlogs', (ctx) => {
		obtenerFichero('errores',ctx);
	});
}

if (fs.existsSync('./errores.log') === false) crearFichero('errores');
if (fs.existsSync('./registro.log') === false) crearFichero('registro');
function crearFichero(fichero)
{
	//Comprobar si el archivo bot.log existe, si no crearlo
  
	fs.writeFileSync(`./${fichero}.log`, `----------------Logs de ${fichero}---------------\n`);
    
}

function botError(msg, error){
	
	fs.appendFileSync('./errores.log', `\nError en el bot: ${msg} \n${error}` + `\n${new Date()}\n`);
}

function botLog(msg){
	fs.appendFileSync('./registro.log', `\nLog: ${msg}` + `\n${new Date()}\n`);
}


function borrarFichero(fichero,ctx) {
	let ruta = `./${fichero}.log`;
	if(cAdmin.comprobarAdmin(ctx)=== false){
		ctx.reply('Tienes que ser administrador para ejecutar este comando.');
	}else{
		if (fs.existsSync(ruta) != false) {
			try {
				fs.unlinkSync(ruta);
				console.log('Un administrador ha borrado el fichero log de errores' + new Date);
				crearFichero(fichero);
				ctx.reply('El archivo de errores log, ha sido borrado.');
			} catch(err) {
				console.error('No se pudo borrar el fichero de errores', err);
				ctx.reply('Hubo un error al borrar el fichero, revisa la consola de comandos.');
			}
		}else{
			ctx.reply('No existe el fichero registro.log.  ¿Se eliminó recientemente? Consulta la consola de comandos.');
		}
	}
    
      
}

function obtenerFichero(fichero){

	let ruta = `./${fichero}.log`;
	
	if (fs.existsSync(ruta) != false) {
		let fichero = fs.readFileSync(ruta, 'utf-8');
		return(fichero);
	}
	else{
		return('No existe el fichero registro.log.  ¿Se eliminó recientemente? Consulta la consola de comandos.');
	}
	
}

module.exports = {
	botError,
	crearFichero,
	botLog,
	borrarFichero,
	obtenerFichero,
	commands
};
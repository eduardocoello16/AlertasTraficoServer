const fs = require('fs');
const cAdmin = require('./accionesBot/admin');

function commands(bot){
	bot.command('delerrorlog', (ctx) => {
		borrarFichero(ctx);
	});
	bot.command('geterrorlog', (ctx) => {
		obtenerFichero(ctx);
	});
}
function crearFichero()
{
	//Comprobar si el archivo bot.log existe, si no crearlo
  
	fs.writeFileSync('./errores.log', '----------------Registro de errores---------------\n');
    
}

function botError(msg, error){
	if (fs.existsSync('./errores.log') === false) crearFichero();
	fs.appendFileSync('./errores.log', `\nError en el bot: ${msg} \n${error}` + `\n${new Date()}\n`);
}


function borrarFichero(ctx) {
	if(cAdmin.comprobarAdmin(ctx)=== false){
		ctx.reply('Tienes que ser administrador para ejecutar este comando.');
	}else{
		if (fs.existsSync('./errores.log') != false) {
			try {
				fs.unlinkSync('./errores.log');
				console.log('Un administrador ha borrado el fichero log de errores' + new Date);
				ctx.reply('El archivo de errores log, ha sido borrado.');
			} catch(err) {
				console.error('No se pudo borrar el fichero de errores', err);
				ctx.reply('Hubo un error al borrar el fichero, revisa la consola de comandos.');
			}
		}else{
			ctx.reply('No existe el fichero errores.log.  ¿Se eliminó recientemente? Consulta la consola de comandos.');
		}
	}
    
      
}

function obtenerFichero(ctx){
    
	if(cAdmin.comprobarAdmin(ctx)=== false){
		ctx.reply('Tienes que ser administrador para ejecutar este comando.');
	}else{
		if (fs.existsSync('./errores.log') != false) {
			let fichero = fs.readFileSync('./errores.log', 'utf-8');
			ctx.reply(fichero);
		}
		else{
			ctx.reply('No existe el fichero errores.log.  ¿Se eliminó recientemente? Consulta la consola de comandos.');
		}
	}
}

module.exports = {
	botError,
	crearFichero,
	borrarFichero,
	obtenerFichero,
	commands
};
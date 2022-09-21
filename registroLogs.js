const fs = require('fs');
const cAdmin = require('./accionesBot/admin');
if (fs.existsSync('./registro.log') === false) crearFichero();
function commands(bot){
	bot.command('dellog', (ctx) => {
		borrarFichero(ctx);
	});
	bot.command('logs', (ctx) => {
		obtenerFichero(ctx);
	});
}
function crearFichero()
{
	//Comprobar si el archivo bot.log existe, si no crearlo
  
	fs.writeFileSync('./registro.log', '----------------Registro de logs---------------\n');
    
}

function botError(msg, error){
	
	fs.appendFileSync('./registro.log', `\nError en el bot: ${msg} \n${error}` + `\n${new Date()}\n`);
}

function botLog(msg){
	fs.appendFileSync('./registro.log', `\nLog: ${msg}` + `\n${new Date()}\n`);
}


function borrarFichero(ctx) {
	if(cAdmin.comprobarAdmin(ctx)=== false){
		ctx.reply('Tienes que ser administrador para ejecutar este comando.');
	}else{
		if (fs.existsSync('./registro.log') != false) {
			try {
				fs.unlinkSync('./registro.log');
				console.log('Un administrador ha borrado el fichero log de errores' + new Date);
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

function obtenerFichero(ctx){
    
	if(cAdmin.comprobarAdmin(ctx)=== false){
		ctx.reply('Tienes que ser administrador para ejecutar este comando.');
	}else{
		if (fs.existsSync('./registro.log') != false) {
			let fichero = fs.readFileSync('./registro.log', 'utf-8');
			ctx.reply(fichero);
		}
		else{
			ctx.reply('No existe el fichero registro.log.  ¿Se eliminó recientemente? Consulta la consola de comandos.');
		}
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
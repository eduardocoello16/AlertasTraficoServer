const admin = require('./admin')
const fs = require('fs');
//Funciones para abrir el archivo json
function obtenerFiltro() {
    //Comprobar el usuario es admin
        let rawdata = fs.readFileSync('filtro.json');
        let result = JSON.parse(rawdata);
        return result 
}

function guardarFiltro(filtro) {
    fs.writeFileSync('filtro.json', JSON.stringify(filtro))
}

//Funciones de los comandos

//Obtener BlackList 

function getBlackList(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtrado = obtenerFiltro(ctx)
            ctx.reply(`Black List:\n${filtrado.blackList}`)
        } else {
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        
        ctx.reply('Error interno del bot')
    }
}
function getBlackListGroup(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtrado = obtenerFiltro( ctx)
            ctx.reply(`Black List Grupo:\n${filtrado.blackListGroup}`)
        } else {
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
       ctx.reply('Error interno del bot')

    }
}


function getWhiteList(ctx){
  try {
    if (admin.comprobarAdmin(ctx) === true) {
        let filtrado = obtenerFiltro( ctx)
        ctx.reply(`WhiteList:\n${filtrado.whiteList}`)
    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
  } catch (error) {
    ctx.reply('Error interno del bot')
  }
}

//Añadir a la lista


function addBlackList(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede añadir una palabra a la BlackList')
            }
            else{
                filtro.blackList.push(ctx.message.text.split(' ')[1])
                guardarFiltro(filtro)
                ctx.reply('Palabra añadida a la BlackList')
            }
           
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        ctx.reply('Error interno del bot')
    }
}
function addWhiteList(ctx) {
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede añadir una palabra a la WhiteList')
            }
            else{
                filtro.whiteList.push(ctx.message.text.split(' ')[1])
                guardarFiltro(filtro)
                ctx.reply('Palabra añadida a la WhiteList')
            }
           
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        ctx.reply('Error interno del bot')
    }
}

function addBlackListGroup(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede añadir una palabra a la Black Group List')
            }
            else{
                filtro.blackListGroup.push(ctx.message.text.split(' ')[1])
                guardarFiltro(filtro)
                ctx.reply('Palabra añadida a la Black Group List')
            }
           
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        ctx.reply('Error interno del bot')
    }
}

module.exports = {
    getBlackList,
    getBlackListGroup,
    getWhiteList,
    addBlackList,
    addWhiteList,
    addBlackListGroup
  };
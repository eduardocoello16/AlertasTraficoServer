const admin = require('./admin')
const fs = require('fs');
const errores = require('../errores')
const errorInterno = 'Error interno del bot, por favor contacta con el desarrollador. Ver error -> /geterrorlog'
//Funciones para abrir el archivo json
function obtenerFiltro() {
    try {
        let rawdata = fs.readFileSync('filtro.json');
        let result = JSON.parse(rawdata);
        return result 
    } catch (error) {
        let msg = 'Error al obtener filtro.'
        errores.botError(msg, error)
        return false
    }
        
}

function guardarFiltro(filtro) {
    try {
        fs.writeFileSync('filtro.json', JSON.stringify(filtro))
        return true
    } catch (error) {
        let msg = 'Error al guardar filtro.'
        errores.botError(msg, error)
        return false
    }
    
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
        let msg = 'Error al obtener la blackList.'
        errores.botError(msg, error)
        ctx.reply('Error interno del bot, por favor contacta con el desarrollador')
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
        let msg = 'Error al obtener la blackList para el grupo.'
        errores.botError(msg, error)
        ctx.reply(errorInterno)

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
    let msg = 'Error al obtener la White List para el grupo.'
    errores.botError(msg, error)
    ctx.reply(errorInterno)
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
                if(filtro.blackList.indexOf(ctx.message.text.split(' ')[1]) != -1){
                    ctx.reply('La palabra ya se encuentra en la BlackList')
                }else{
                    filtro.blackList.push(ctx.message.text.split(' ')[1])
                    guardarFiltro(filtro)
                    ctx.reply('Palabra añadida a la BlackList')
                }
             
            }
           
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al añadir a la Black List.'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
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
                if(filtro.whiteList.indexOf(ctx.message.text.split(' ')[1]) != -1){
                    ctx.reply('La palabra ya se encuentra en la WhiteList')
                }else{
                filtro.whiteList.push(ctx.message.text.split(' ')[1])
                guardarFiltro(filtro)
                ctx.reply('Palabra añadida a la WhiteList')
            }
        }
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al añadir a la White List para el grupo.'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
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
                if(filtro.blackListGroup.indexOf(ctx.message.text.split(' ')[1]) != -1){
                    ctx.reply('La palabra ya se encuentra en la BlackList')
                }else{
                filtro.blackListGroup.push(ctx.message.text.split(' ')[1])
                guardarFiltro(filtro)
                ctx.reply(errorInterno)
            }
        }
           
        
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al obtener la blackList para el grupo.'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
    }
}
function delWhiteList(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede borrar de una en una palabra a la WhiteList')
            }
            else{
                //Comprobar que la palabra está en el array del filtro
                let posEncontrado = filtro.whiteList.indexOf(ctx.message.text.split(' ')[1])
                if(posEncontrado === -1){
                    //No está en el filtro
                    ctx.reply('La palabra no está en el filtro')
                }else{
                    filtro.whiteList.splice(posEncontrado, 1)
                    guardarFiltro(filtro)
                    if(posEncontrado != -1) delWhiteList(ctx)
                    ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
                }
            }
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al borrar un elemento en la White List'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
    }
}
function delBlackList(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede borrar de una en una palabra a la BlackList')
            }
            else{
                //Comprobar que la palabra está en el array del filtro
                let posEncontrado = filtro.blackList.indexOf(ctx.message.text.split(' ')[1])
                if(posEncontrado === -1){
                    //No está en el filtro
                    ctx.reply('La palabra no está en el filtro')
                }else{
                    filtro.blackList.splice(posEncontrado, 1)
                    guardarFiltro(filtro)
                    if(posEncontrado != -1) delBlackList(ctx)
                    ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
                }
            }
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al borrar un elemento en la black List'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
    }
}
function delBlackListGroup(ctx){
    try {
        if (admin.comprobarAdmin(ctx) === true) {
            let filtro = obtenerFiltro()
            if(ctx.message.text.split(' ').length != 2){
                ctx.reply('Solo se puede borrar de una en una palabra a la Black Group List')
            }
            else{
                //Comprobar que la palabra está en el array del filtro
                let posEncontrado = filtro.blackListGroup.indexOf(ctx.message.text.split(' ')[1])
                if(posEncontrado === -1){
                    //No está en el filtro
                    ctx.reply('La palabra no está en el filtro')
                }else{
                    filtro.blackListGroup.splice(posEncontrado, 1)
                    guardarFiltro(filtro)
                    if(posEncontrado != -1) delBlackListGroup(ctx)
                    ctx.reply(`La palabra ${ctx.message.text.split(' ')[1]} ha sido borrada con éxito` )
                }
            }
        }else{
            ctx.reply('No tienes permisos para ejecutar este comando')
        }
    } catch (error) {
        let msg = 'Error al borrar un elemento en la black List del grupo'
        errores.botError(msg, error)
        ctx.reply(errorInterno)
    }
}
function filtradoAcceso(tweet) {
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let whiteList = result.whiteList;
    let blackList = result.blackList;
    let tweetText = tweet.text.toLowerCase()

    try {
        whiteList.forEach(element => {
            if (tweetText.indexOf(element.toLowerCase()) != -1) {
    
                salida = true
            }
        })
        blackList.forEach(element => {
            if (tweetText.indexOf(element.toLowerCase()) != -1) {
               
                salida = false
            }
        })
        //Descartar los retweets
        if(tweetText[0] === 'r' && tweetText[1] === 't'){
         salida =   false
        }else{
            console.log(tweetText[0] + ' ' +
                tweetText[1])
        }
    } catch (error) {
        console.log(error)
    }
    
    return salida
}

function filtradoBlackListGroup(tweet) {
    let salida = false
    let rawdata = fs.readFileSync('filtro.json');
    let result = JSON.parse(rawdata);
    let blackListGroup = result.blackListGroup;
    let tweetText = tweet.text.toLowerCase();
    let arrayTweetText = tweetText.split(' ');
    blackListGroup.forEach(element => {
        if (arrayTweetText.includes(element.toLowerCase())) {

            salida = true
        }
    })
    return salida
}
module.exports = {
    getBlackList,
    getBlackListGroup,
    getWhiteList,
    addBlackList,
    addWhiteList,
    addBlackListGroup,
    delWhiteList,
    delBlackList,
    delBlackListGroup,
    filtradoAcceso,
    filtradoBlackListGroup
  };
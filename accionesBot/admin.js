const variables = require('./variables')


function comprobarAdmin(ctx) {
   
    let salida = false
    let id;
    if (ctx.update.message.chat.type === 'private') {
        id = ctx.message.from.id
    } else {
        id = ctx.update.message.from.id
    }

    if (id === null) {
        id = ctx.update.message.from.id
    }
   
    if (variables.usuariosAdmin.includes(id)) {
        salida = true
    }

    return salida
}


module.exports = {
    comprobarAdmin
  };
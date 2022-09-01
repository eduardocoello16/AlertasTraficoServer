const variables = require('../variables')



function comprobarAdmin(ctx) {
   
    let salida = false
    let id;
    if (ctx.message.chat.type === 'private') {
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

async function deleteAdmin(ctx, bot){
    if (comprobarAdmin(ctx) === true) {
       
        //Obtener usuario a añadir a la lista de administradores
        let id = ctx.message.text.split(' ')[1]
        //Comprobar que un usuario es anonimo
        try {
            let user = await bot.telegram.getChatMember(variables.grupoAlertas, id)
            if (user.status === 'left') {
                ctx.reply('El usuario no está en el grupo')
            } else {
                //Añadir usuario a la lista de administradores
                try {
                    await bot.telegram.promoteChatMember(grupoAlertas, id, {})
                    ctx.reply(`Se han actualizado los permisos del usuario ${user.user.first_name} ${user.user.last_name}`)
                } catch (error) {
                    console.log(error)
                    ctx.reply('Error al añadir usuario')
                }
            }
        } catch (error) {
            console.log(error)
            ctx.reply('Id o nombre inválido')
        }
    } else {
        ctx.reply('No tienes permisos para ejecutar este comando')
    }
}

function broadcast(ctx, bot){
    if (comprobarAdmin(ctx)) {
        let mensaje = ctx.message.text
        mensaje = mensaje.replace('/broadcast', '')
        if (mensaje === '') {
            ctx.reply('Mensaje vacío')
        } else {
            try {
                bot.telegram.sendMessage(variables.grupoAlertas, mensaje)
            } catch (error) {
                ctx.reply('Error interno del bot')
                
            }
        }
    } else {
        ctx.reply('Tienes que ser admin para ejecutar este comando.')
    }
}

module.exports = {
    comprobarAdmin,
    deleteAdmin,
    broadcast
    
  };
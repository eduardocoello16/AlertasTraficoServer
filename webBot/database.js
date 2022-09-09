//Base de datos 
const mongoose = require('mongoose')
const usuarioModel = require('./models/user');
const variables = require('../variables')

mongoose.connect(variables.mongoDbUri)
.then(() => console.log("Conexión base datos satisfactoria."))
.catch((error) => console.error(error))

async function obtenerUsuario(idUsuario){
   return await usuarioModel.findOne({id: idUsuario})
}

async function crearUsuario(userData){
    let user = await usuarioModel(userData)
    try {
       return await user.save()
       
    } catch (error) {
       return null
       console.log(error)
    }   
}

async function actualizarFechaCreation(user){
    user.Date_creation = new Date()
    console.log(user.Date_creation)
   try {
    user.save()
   } catch (error) {
    console.log(error)
    return null
   }
}

module.exports = {
    obtenerUsuario,
    crearUsuario,
    actualizarFechaCreation
}
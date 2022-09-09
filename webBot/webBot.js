const HmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')
const crypto = require('crypto-js')
var express = require('express');
var app = express();
var bp = require('body-parser')
const variables = require('../variables')
const cors = require('cors')
const mongoose = require('mongoose')
const usuarioModel = require('./models/user');
const { Markup } = require('telegraf');

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())
app.listen(2000, () =>{
    console.log("Servidor levantado correctamente en  http://localhost:" + 2000 )
})

//Base de datos 

mongoose.connect(variables.mongoDbUri)
.then(() => console.log("Conexión base datos satisfactoria."))
.catch((error) => console.error(error))







function comprobarHash(WebAppData, hash){
   
    const q = new URLSearchParams(WebAppData);
    q.delete("hash");
     const v = Array.from(q.entries());
      v.sort(([aN, aV], [bN, bV]) => aN.localeCompare(bN));
      const data_check_string = v.map(([n, v]) => `${n}=${v}`).join("\n");
      var secret_key = HmacSHA256(variables.botToken, "WebAppData")
      var key = HmacSHA256(data_check_string, secret_key).toString(Hex);
    var salida = false;
      if(hash == key){
        salida = true
        console.log('Correcto')
        
      }

      return salida
}

function rutas(bot){



app.post('/nuevoUsuario', async function(req, res){
    let hash = req.body.hash
    let WebAppData = req.body.WebAppData

    if(comprobarHash(WebAppData, hash)){
    const getUsuario = await usuarioModel.findOne({id: req.body.userData.id})
    if(getUsuario){
       console.log(getUsuario.Date_creation)
       enviarSolicitud(getUsuario, bot)
       res.status(200).send(getUsuario)
    }else{

   
    let user = await usuarioModel(req.body.userData)
    try {
        await user.save()
        res.status(200).send(user)
        enviarSolicitud(user, bot)
    } catch (error) {
        res.status(500).send(
            {
                "msg": "Error en el servidor al guardar el usuario"
            }
        )
    }   
}
}else{
    res.status(500).send(
        {
            "msg": "El hash no es correcto."
        }
    )
}
    })




//Comprobar si el usuario está en el grupo
app.post('/comprobarusuario', async function(req, res) {
   console.log('Comprobando usuario' )
    let id = req.body.id
    let hash = req.body.hash
    let WebAppData = req.body.WebAppData
   
    if(comprobarHash(WebAppData, hash)){

       
        
    try {
        const getUsuario = await usuarioModel.findOne({id: id})
        
            res.status(200).send( {
                user: getUsuario,
                web_status: variables.usuariosPublicaciones
            })
        
        
    } catch (error) {
        
        console.log(error)
        res.status(500).send({
            "msg": "Error en el servidor"
        })
    }
    
}
else{
    res.status(500).send({
        "msg": "El hash del bot no es válido."
    })
       }
   });



 

}



 async function enviarSolicitud(user, bot){
    console.log('enviando mensaje')
  let message = `El usuario ${user.first_name} ${user.last_name} solicita permiso para hacer publicaciones en el canal.`;
 bot.telegram.sendMessage(variables.grupoAdmins, message, {
  ...Markup.inlineKeyboard([
    [
    Markup.button.callback('Aceptar', `aceptar_solicitud:${user.id}`),
    Markup.button.callback('Denegar', `denegar_solicitud:${user.id}`),
    ], 
    [
        Markup.button.callback('Denegar y bloquear', `ban_solicitud:${user.id}`),
    ],
    [
        Markup.button.url(`Ver perfil de ${user.first_name}`, `tg://user?id=${user.id}`)
    ]
  ]
  )
})


}


function aceptarUsuario(){
    console.log('Aceptado')
}

module.exports = {
    rutas,
    aceptarUsuario
  };
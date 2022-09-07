const HmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')
const crypto = require('crypto-js')
var express = require('express');
var app = express();
var bp = require('body-parser')
const variables = require('../variables')
const cors = require('cors')
const mongoose = require('mongoose')
const usuarioModel = require('./models/user')

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







function comprobarHash(WebAppData, hash, bot_token){
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
    const getUsuario = await usuarioModel.findOne({id: req.body.userData.id})
    if(getUsuario){
        res.status(400).send({
            "msg": 'El usuario ya existe'
           
        })
        console.log('el usuario ya existe')
    }else{

   
    let user = await usuarioModel(req.body.userData)
    try {
        await user.save()
        res.status(200).send(user)


    } catch (error) {
        res.status(500).send(
            {
                "msg": "Error en el servidor al guardar el usuario"
            }
        )
    } 
    
    
    
}
    })




//Comprobar si el usuario está en el grupo
app.post('/comprobarusuario', async function(req, res) {
   console.log('Comprobando usuario' )
    let id = req.body.id
    let hash = req.body.hash
    let WebAppData = req.body.WebAppData
    const bot_token = variables.WebAppData

    if(comprobarHash(WebAppData, hash, bot_token)){

       

    try {
        const getUsuario = await usuarioModel.findOne({id: id})
        if(getUsuario){
            res.status(200).send(true)
        }else{
            res.status(200).send(false)
        }
        
    } catch (error) {
        
        console.log(error)
        res.status(500).send({
            "msg": "Error en el servidor"
        })
    }
    
}else{
    res.status(500).send({
        "msg": "El hash del bot no es válido."
    })
}
   });

}


module.exports = {
    rutas
  };
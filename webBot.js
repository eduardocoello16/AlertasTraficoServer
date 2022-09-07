const HmacSHA256 = require('crypto-js/hmac-sha256')
const Hex = require('crypto-js/enc-hex')
const crypto = require('crypto-js')
var express = require('express');
var app = express();
var bp = require('body-parser')
const variables = require('./variables')
const cors = require('cors')


app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())
app.listen(2000, () =>{
    console.log("Servidor levantado correctamente en  http://localhost:" + 2000 )
})


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



app.post('/respuesta', function(req, res){
  
    console.log('ENtró')
    console.log(bot)
    })




//Comprobar si el usuario está en el grupo
app.post('/usuariogrupo', async function(req, res) {
    let id = req.body.id
    let hash = req.body.hash
    let WebAppData = req.body.WebAppData
    const bot_token = variables.WebAppData

    if(comprobarHash(WebAppData, hash, bot_token)){

   

    try {
        let user = await bot.telegram.getChatMember(variables.grupoAlertas, id)
        if(user.status === 'left'){
            res.status(200).send(false)
        }else{
          //  bot.telegram.sendMessage(user.user.id, 'Se abrió la web ' +  user.user.first_name)
            res.status(200).send(true)
        }
        
    } catch (error) {
        console.log(user)
        console.log(error)
        res.status(200).send(false)
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
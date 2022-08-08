
  require('dotenv').config({path: './.env'});
  async function getTwett(id){
    const axios = require('axios').default;

      var url = `https://api.twitter.com/2/users/${id}/tweets`;
        var token =  process.env.Twitter_token;
       
        var config = {
          headers: { Authorization: `Bearer ${token}` }
          
        }
  let result = await  axios.get(url, config)
    
       return result.data.data[0]
      
  }



  module.exports = {
    getTwett
  };
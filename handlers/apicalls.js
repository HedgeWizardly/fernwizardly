var cheese = require('cheese-name');

const request = require('request');




module.exports.dadjoke = async function(callback) {
  
  request({
  method: 'GET',
  url: 'https://dad-jokes.p.rapidapi.com/random/joke',
  headers: {
    'x-rapidapi-host': 'dad-jokes.p.rapidapi.com',
    'x-rapidapi-key': '998a651d97msh5bac1de891ae02cp18a887jsnd0d136320c99',
    useQueryString: true
  }
}, function (error, response, body) {
	if (error) throw new Error(error);
	callback(JSON.parse(body).body[0]);
});
  
  
}


module.exports.pronouns = async function(username, callback) {
  
  username = username.replace(/\W/g, '')

  try {
          //let data = await request(`https://pronouns.alejo.io/api/users/${username}`)
          //let pronoun = await data.json();
          //console.log(pronoun);
          //console.log(pronoun[0].pronoun_id);

   request({
  method: 'GET',
  url: `https://pronouns.alejo.io/api/users/${username}`,
 
}, function (error, response, body) {
    body = JSON.parse(body)
     if(body.length==0) {
       callback(null)
     } else {
       callback( body[0].pronoun_id);
     }
});
    
    
  } catch(e) {
    console.log(e)
    callback( undefined);
  }
}



require('dotenv').config();
const fs = require('fs');
const debug = true;



const log = function(str) {
  if(debug)console.log(str);
}

module.exports.getLurkMessages = async function (callback) {
  
  const lurkmsgs = await JSON.parse(fs.readFileSync(`/app/files/messages/lurk.json`));
  
  callback(lurkmsgs);
  
}

const getCodes = async function (username, callback){

            

      var codeList = [];
      
      // Code Type,	Code,	Redeemer,	Redeemed At,	Redemption ID
      let values = ["one","two"];
      
      for (let i=1; i<values.length;i++) {
        if(values[i][2]==username) {
          const code={code:values[i]}

            codeList.push(code)
        }
        
      }

      callback(codeList);


  
  
}

module.exports.getCodes = getCodes;



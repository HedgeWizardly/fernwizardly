const router = require('express').Router();
const messages = require('../scripts/messages');
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./files/users.json'));

const authCheck = (req, res, next) => {
    if(!req.user || !users.moderators.includes(req.user.data[0].login)){
      
        res.redirect('/auth/login');
    } else {
      //console.log("not logged in")
        next();
    }
};

router.get('/lurkmessages', authCheck, async function(req, res,next) {
 //  var username = req.user.data[0].login;
 // if(!users.moderators.includes(req.user.data[0].login)) {
 //   res.redirect('/auth/login');
 //   return;
 // }
  
  try{

    await messages.getLurkMessages((result)=> {
      for(let i=0; i<result.length;i++) {
        if(result[i].enabled) {
          result[i].enabled="checked";
        } else {
          
        }
      }
    res.render('lurkmessages',{messages:result}) 
  });
    
  }catch(e) {
    console.log(e)
  }
  
  
});



module.exports = router;


const router = require('express').Router();
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./files/users.json'))

const authCheck = (req, res, next) => {
    if(!req.user || !users.moderators.includes(req.user.data[0].login)){
      
        res.redirect('/auth/login');
    } else {
      //console.log("not logged in")
        next();
    }
};

router.get('/', authCheck, async function(req, res,next) {
  //console.log(req.user)
  var username = req.user.data[0].login;
  
  if(users.moderators.includes(username)) {
    res.render('profile',{username, url:null});
  } else {
    res.redirect('/auth/login');
    
  }
});



module.exports = router;


const router = require('express').Router();
const passport = require('passport');
const fs = require('fs');
const { ClientCredentialsAuthProvider, exchangeCode } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");

router.get("/login",(req,res) => {
  res.render('login');
  
});


router.get('/logout',(req,res) => {
  
  req.logout();
  res.redirect('/')
});


// auth with twitch

router.get('/twitch', passport.authenticate('twitch', { 
  scope: 'user:read:email' 
}));

router.get('/twitch/broadcaster', passport.authenticate('twitch', { 
  scope: 'user:read:email' 
}));

// Set route for OAuth redirect
router.get('/twitch/redirect', passport.authenticate('twitch', { successRedirect: '/profile/', failureRedirect: '/' }),(req,res) => {
  console.log("redirecting to profile")
  //res.redirect('/profile/');
});

module.exports = router;


// router.get('/twitch/adminredirect/',async function(req,res){
//   let accessToken = await exchangeCode(process.env.CLIENTID,process.env.CLIENTSECRET,req.query.code,"/finalTokens")
//   fs.writeFileSync(".data/tokens.json", JSON.stringify(accessToken, null, 4),"UTF-8");
//   console.log("AdminRedirect")
//   console.log(req);
// });

// router.get("/finalTokens",function(req,response) {
//     console.log("\n==========\n")
//   console.log("FinalTokens")
//     console.log(req.query.body)
    
//   });
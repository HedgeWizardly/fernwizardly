const router = require('express').Router();


router.get('/testing', async function(req, res,next) {
  
  res.send("<marquee>Hello world</marquee>");
  

});



module.exports = router;


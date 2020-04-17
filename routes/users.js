var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var heba = 'My name is heba';
  res.send(heba);
});

module.exports = router;

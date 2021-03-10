var express = require('express');
var router = express.Router();
const session = require('./session');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

router.use(session)
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {data: req.session.userid})
});

module.exports = router;

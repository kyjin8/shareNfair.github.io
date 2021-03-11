var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const ejs = require('ejs');
const fs = require('fs')
const path = require('path')

router.use(session)

/* GET home page. */
router.get('/', function(req, res, next) {
  client.query('select * from posts', (err, results) => {
    if(err) {
      console.error(err);
    } else {
      console.log('results', results);
      return results;
    }
  })
  res.render('index', {login: req.session.userid})
});

module.exports = router;

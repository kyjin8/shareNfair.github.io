var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const moment = require('moment');

router.use(session)

/* GET home page. */
router.get('/', function(req, res, next) {
  client.query('select * from posts ORDER BY id', (err, results) => {
    res.render('index', {login: req.session.userid, posts: results, moment: moment})
  })
});

module.exports = router;

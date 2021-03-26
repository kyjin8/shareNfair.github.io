var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const moment = require('moment');

router.use(session)

/* GET home page. */
router.get('/', function(req, res, next) {
  client.query('select * from posts ORDER BY hit DESC, id DESC LIMIT 10', (err, results) => {
    res.render("index", {
      logined: req.session.logined,
      login: req.session.userid,
      username: req.session.username,
      posts: results,
      moment: moment,
    });
  })
});

module.exports = router;

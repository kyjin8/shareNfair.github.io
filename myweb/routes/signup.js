var express = require('express');
var router = express.Router();
const mysql = require('mysql2');

const client = mysql.createConnection({
  user:'root',
  password:'1234',
  database:'member',
  port: 3307
});

client.query('use member')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('signup');
});
router.post('/', (req, res, next) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<script>alert('축하합니다. 가입이 완료되었습니다.');location.href='/';</script>");
});


module.exports = router;

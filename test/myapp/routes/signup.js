var express = require('express');
var router = express.Router();
const mysql = require('mysql2');

const client = mysql.createConnection({
  user:'root',
  password:'1234',
  database:'member',
  port: 3307
});




/* GET home page. */
router.get('/', (req, res) => { 
  res.render('signup');
});
router.post('/', (req, res, next) => {
  const body = req.body;
  client.query('use member')
  client.query('insert into users(userid, userpwd, username) values(?, ?, ?)', [body.id, body.pwd, body.name], () => {
      console.log(body.id, body.pwd);
    }
  )
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<script>alert('축하합니다. 가입이 완료되었습니다.');location.href='/';</script>");
});


module.exports = router;

var express = require('express');
var router = express.Router();
const client = require('./mysql');
const crypto = require('crypto');

const key = "myKeyasdfqwerzxc";
const IV_LENGTH = 16;
function encrypt(text) {
  //암호화
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-128-cfb', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ":" + encrypted.toString('hex');
}

/* GET home page. */
router.get('/', (req, res) => { 
  // console.log('암호화', encrypt('ruru123'));
  res.render('signup');
});

router.post('/', (req, res) => {
  const body = req.body;
  const pwd = encrypt(req.body.pwd);
  client.query('insert into users(userid, userpwd, username) values(?, ?, ?)', [body.id, pwd, body.name], () => {
      console.log(body.id, pwd);
    }
  )
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<script>alert('축하합니다. 가입이 완료되었습니다.');location.href='/';</script>");
});

router.post('/checkid', (req, res) => {
  console.log('inp-id :', req.body.data);
  client.query('SELECT * FROM users WHERE userid = ?', [req.body.data], (err, results) => {
    if (results[0]) { //중복
      res.send({result: false});
      console.log('사용 불가 ID');
    } else {
      res.send({result: true});
      console.log('사용 가능 ID');
    }
  })
})


module.exports = router;

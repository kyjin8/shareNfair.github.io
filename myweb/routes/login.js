var express = require('express');
var router = express.Router();
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const session = require('./session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { route } = require('.');

router.use(session)

const client = mysql.createConnection({
    user:'blockchain',
    password:'Qmffhrcpdls1!',
    database:'kyjin8',
    port: 3307
});

client.query('use kyjin8')

router.get('/', function(req, res, next) {
    fs.readFile(path.dirname(__dirname)+'/views/login.ejs','utf-8', (err, data) => {
        res.send(data);
    })
});
router.post('/', (req, res, next) => {
    const body = req.body;
    fs.readFile(path.dirname(__dirname)+'/views/login.ejs','utf-8', (err, data) => {
        client.query('SELECT * FROM users where userId = ?', [body.id],
        (err,results) => {
            if(results != '') {
                console.log('req.session', req.session)
                if(body.pwd == results[0].userpwd){
                    req.session.logined = true;
                    req.session.userid = body.id;
                    res.redirect("/");
                } else {
                    res.send('<script>alert("아이디 혹은 비밀번호가 틀렸습니다.");history.back();</script>')
                }
            } else {
                res.send('<script>alert("아이디 혹은 비밀번호가 틀렸습니다.");history.back();</script>')
            }
        });
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const session = require('./session');
const client = require('./mysql');
const crypto = require('crypto');
const { route } = require('.');

router.use(session)

const key = "myKeyasdfqwerzxc";
function decrypt(text) {
    //복호화
    console.log('text', text);
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-128-cfb', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrpyted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

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
            // console.log('results',results);
            // console.log('asdf', body.pwd)
            if(results != '') {
                const pwd = decrypt(results[0].userpwd);
                // console.log('req.session', req.session)
                if(body.pwd == pwd){
                    req.session.logined = true;
                    req.session.userid = body.id;
                    req.session.username = results[0].username;
                    res.redirect('/');
                    // res.send('<script>history.go(-2);</script>')
                } else {
                    // console.log(body.pwd);
                    // console.log(pwd);
                    res.send('<script>alert("아이디 혹은 비밀번호가 틀렸습니다.");history.back();</script>')
                }
            } else {
                res.send('<script>alert("아이디 혹은 비밀번호가 틀렸습니다.");history.back();</script>')
            }
        });
        // console.log('data', data);
        // res.send(
        //     ejs.render(data, {
        //         data: req.session.logined,
        //     })
        // );
    });
});

module.exports = router;

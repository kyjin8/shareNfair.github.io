const express = require('express');
const router = express.Router();

var user = {id: "kyjin", pwd: "1111"};

router.get('/', function(req, res, next) {
    res.render('login');
});
router.post('/', (req, res, next) => {
    let body = req.body;
    if(body.id === user.id && body.pwd === user.pwd){
        // req.session.logined = true;
        // req.session.id = body.id;
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<script>alert('로그인 성공');location.href='/';</script>");
    } else {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
        "<script>alert('아이디 혹은 비번이 없는 사용자입니다.');history.back();</script>"
        );
    }
});

module.exports = router;

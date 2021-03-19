var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const moment = require('moment');
const path = require('path');
const multer = require('multer');

router.use(session);

router.post('/', (req, res) => {
    res.send({
        result: true
    });
})
router.get("/:id/:postuser/:dealuser", (req, res) => {
    if (!req.session.logined) res.send('<script>location.href="/login";</script>');
    if (req.session.userid != req.params.postuser && req.session.userid != req.params.dealuser) res.send('<script>alert("잘못된 접근입니다."); window.close();</script>');
    let postuser_img, dealuser_img;
    client.query('SELECT * FROM users WHERE userid = ?', [req.params.postuser], (err, results) => {
        // console.log('postuser img :', results[0].userimg);
        postuser_img = results[0].userimg ? results[0].userimg : '' ;
        client.query('SELECT * FROM users WHERE userid = ?', [req.params.dealuser], (err, results) => {
            // console.log('dealuser img :', results[0].userimg);
            dealuser_img = results[0].userimg ? results[0].userimg : '' ;
            client.query('SELECT * FROM chatlists WHERE postuser = ? AND dealuser = ? AND postid = ?', [req.params.postuser, req.params.dealuser, req.params.id], (err, results) => {
                console.log(results[0]);
                if(!results[0]){
                    client.query('INSERT INTO chatlists(postuser, dealuser, postid) VALUES(?, ?, ?)', [req.params.postuser, req.params.dealuser, req.params.id]);
                }
                client.query('SELECT * FROM chat LEFT JOIN chatlists ON chat.listNo = chatlists.id WHERE postuser = ? AND dealuser = ? AND chat.postid = ? ORDER BY chat.id', [req.params.postuser, req.params.dealuser, req.params.id], (err, results) => {
                    const chat_record = results;
                    console.log('채팅내역 불러오기', results);
                    if(chat_record[0]) {
                        res.render("chat", {
                            logined: req.session.logined,
                            login: req.session.userid,
                            postuser: req.params.postuser,
                            dealuser: req.params.dealuser,
                            postid: req.params.id,
                            postuser_img: postuser_img,
                            dealuser_img: dealuser_img,
                            listNo: chat_record[0].id
                        });
                    } else {
                        client.query('SELECT * FROM chatlists WHERE postuser = ? AND dealuser = ? AND postid = ?', [req.params.postuser, req.params.dealuser, req.params.id], (err, results) => {
                            // console.log('chat_record')
                            res.render("chat", {
                                logined: req.session.logined,
                                login: req.session.userid,
                                postuser: req.params.postuser,
                                dealuser: req.params.dealuser,
                                postid: req.params.id,
                                postuser_img: postuser_img,
                                dealuser_img: dealuser_img,
                                listNo: results[0].id
                            });
                        })
                    }
                })
            })
        })
    })
});

module.exports = router;
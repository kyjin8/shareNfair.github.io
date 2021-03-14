var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const { route } = require('./session');
const moment = require('moment');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.dirname(__dirname) + "/public/images/uploaded/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + '_' + file.originalname);
    },
});
const upload = multer({ storage: storage });

router.use(session);

// 게시글 목록
router.get('/', function(req, res, next) {
    client.query('select * from posts ORDER BY created DESC, id DESC', (err, results) => {
        res.render('board', {logined: req.session.logined, login:req.session.id, posts: results, moment: moment})
    })
});
// 게시글 생성
router.get('/create', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('SELECT * FROM posts ORDER BY id', (err, results) => {
        res.render('create', {logined: req.session.logined, posts: results});
    })
});
router.post('/create', upload.single('uploadfile'), (req, res) => {
    const body = req.body;
    const file = req.file.filename;
    // console.log('req.body', req.body);
    // console.log('isfile', file);
    client.query('insert into posts(title, price, description, user_id, img) values(?, ?, ?, ?, ?)', [body.title, body.price, body.description, req.session.userid, file], () => {
        console.log(body.title, body.price, req.session.userid);
    })
    res.redirect('/board');
})
// 게시글 수정
router.get('/update/:id', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('SELECT * FROM posts WHERE id=?',[req.params.id], (err, results) => {
        if(err) console.log(err);
        res.render('update', {logined: req.session.logined, posts: results});
    })
});
router.post('/update/:id', upload.single('uploadfile'), (req, res) => {
    const body = req.body;
    const file = req.file.filename;

    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    console.log('주소', req.params.id);
    client.query('UPDATE posts SET title=?, price=?, description=?, img=? WHERE posts.id=?', [body.title, body.price, body.description, file, req.params.id], (err, results) => {
        // if(err) console.log(err);
        console.log(body.title, body.price);
        res.redirect('/board/' + req.params.id);
    })
});
// 게시글 삭제
router.get('/delete/:id', (req, res) => {
    if(!req.session.logined) {
        res.send('<script>location.href="/login"</script>');
    }
    client.query('SELECT * FROM posts WHERE id=?', [req.params.id], (err, results) => {
        const posts = results[0];
        console.log('아이디비교', req.session.userid, posts.user_id);
        if(req.session.userid == posts.user_id){
            client.query('DELETE FROM posts WHERE user_id=? AND id=?', [req.session.userid, req.params.id], (err, results) =>{
                fs.unlink(path.dirname(__dirname) + '/public/images/uploaded/' + posts.img, (err) => {
                    console.error(err);
                });
                res.send('<script>alert("삭제되었습니다."); location.href="/board"</script>');
            })
        } else {
            res.send('<script>alert("잘못된 접근입니다."); location.href="/board"</script>');
        }
    })
})
// 게시물 조회
router.get('/:id', function(req, res, next) {
    // console.log('loginid', req);
    client.query('select * from posts WHERE id=?', [req.params.id], (err, results) => {
        res.render('read', {logined: req.session.logined, login:req.session.userid, posts: results, moment: moment, postid : req.params.id})
    })
});

module.exports = router;

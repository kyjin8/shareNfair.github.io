var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
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
router.get('/', (req, res) => {
    client.query('SELECT * FROM posts ORDER BY created DESC, id DESC', (err, results) => {
        res.render('board', {logined: req.session.logined, login:req.session.userid, posts: results, moment: moment})
    })
});
// 게시글 생성
router.get('/create', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('SELECT * FROM posts ORDER BY id', (err, results) => {
        res.render('board_create', {logined: req.session.logined, posts: results});
    })
});
router.post('/create', upload.single('uploadfile'), (req, res) => {
    const body = req.body;
    const file = req.file.filename;
    client.query(
        "insert into posts(title, price, description, user_id, img) values(?, ?, ?, ?, ?)",
        [body.title, body.price, body.description, req.session.userid, file],
        () => {
            res.redirect("/board");
        }
    );
})
// 게시글 수정
router.get('/update/:id', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('SELECT * FROM posts WHERE id=?',[req.params.id], (err, results) => {
        if(err) console.log(err);
        res.render('board_update', {logined: req.session.logined, posts: results});
    })
});
router.post('/update/:id', upload.single('uploadfile'), (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    const body = req.body;

    if(req.file) { //파일 수정 O
        const file = req.file.filename;
        client.query('SELECT * FROM posts WHERE id=?', [req.params.id], (err, results) => {
            const pre_img = results[0].img;
            client.query('UPDATE posts SET title=?, price=?, description=?, img=? WHERE posts.id=?', [body.title, body.price, body.description, file, req.params.id], (err, results) => {            
                fs.unlink(path.dirname(__dirname) + '/public/images/uploaded/' + pre_img, (err) => {
                    console.error(err);
                });
            })
            res.redirect('/board/' + req.params.id);
        })
    } else {       //파일 수정 X
        client.query('UPDATE posts SET title=?, price=?, description=? WHERE posts.id=?', [body.title, body.price, body.description, req.params.id], (err, results) => {
            res.redirect('/board/' + req.params.id);
        })
    }
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
// 게시글 가격제안
router.post('/deal/:id', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    console.log('body, userid, postid :', req.body, req.session.userid, req.params.id);
    client.query('INSERT INTO deals(postid, userid, deal_price, deal_comment, post_userid) VALUES(?, ?, ?, ?, ?)', [req.params.id, req.session.userid, req.body.price, req.body.comment, req.body.post_userid], (err) => {
        res.send('<script>location.href="/board/' + req.params.id + '";</script>');
    })
})
// 가격제안 수정
router.post('/deal_re/:id', (req, res) => {
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('UPDATE deals SET deal_price=?, deal_comment=? WHERE postid=? AND userid=?', [req.body.price, req.body.comment, req.params.id, req.session.userid], (err) => {
        res.send('<script>location.href="/board/' + req.params.id + '";</script>');
    })
})
// 게시물 조회
router.get('/:id', (req, res) => {
    client.query('SELECT * FROM posts WHERE user_id=? AND id=?', [req.session.userid, req.params.id], (err, results) =>{
        const post_master = results;
        client.query('SELECT * FROM deals WHERE postid = ?', [req.params.id], (err, results) => {	
            const isdealed_post = results;
            console.log('가격제안 데이터 유무체크', isdealed_post, isdealed_post.length);
            client.query('SELECT * FROM deals WHERE postid = ? AND userid = ?', [req.params.id, req.session.userid], (err, results) => {
                const isdealed_user = results;
                console.log('로그인한 사용자가 가격제안 했는지 체크', isdealed_user);
                client.query('SELECT * FROM posts WHERE id=?', [req.params.id], (err, results) => {
                    res.render("board_read", {
                        logined: req.session.logined,
                        login: req.session.userid,
                        posts: results,
                        moment: moment,
                        isdealed_user: isdealed_user,
                        isdealed_post: isdealed_post,
                        post_master: post_master
                    });
                })
            })
        })
    })
});

module.exports = router;

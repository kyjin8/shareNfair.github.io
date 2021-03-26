var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const moment = require('moment');
const { route } = require('./session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { DEFAULT_MIN_VERSION } = require('tls');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.dirname(__dirname) + "/public/images/uploaded/");
  },
  filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + '_' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.use(session)

router.get("/", (req, res) => {
  if (!req.session.logined) {
    res.send('<script>location.href="/login"</script>');
  } else {
    client.query("SELECT * FROM users WHERE userid=?", [req.session.userid], (err, results) => {
        let userimg;
        if (results[0].userimg) {
          userimg = results[0].userimg;
        } else {
          userimg = "";
        }
        console.log("userimg", userimg);
        client.query(
          "SELECT * FROM posts ORDER BY created DESC, id DESC",
          (err, results) => {
            res.render("users", {
              logined: req.session.logined,
              login: req.session.userid,
              username: req.session.username,
              userimg: userimg,
              posts: results,
              moment: moment,
            });
          }
        );
      }
    );
  }
});

router.get('/users_sales', (req, res) => {
  if (!req.session.logined) res.send('<script>location.href="/login"</script>');
  const limit = 5;
  let page = Math.max(1, parseInt(req.query.page));
  page = isNaN(page) ? 1 : page;
  let skip = (page-1) * limit;

  client.query('SELECT * FROM posts WHERE user_id=?', [req.session.userid], (err, cnt) => {
    let count = cnt.length - 1;
    client.query("SELECT * FROM posts WHERE user_id = ? ORDER BY id DESC LIMIT ?, ?", [req.session.userid, skip, limit], (err, results) => {
      // console.log("posts", results);
      let maxPage = Math.ceil(count/limit);
      res.render("board", {
        logined: req.session.logined,
        login: req.session.userid,
        username: req.session.username,
        posts: results,
        moment: moment,
        users: "sales",
        currentPage: page,
        maxPage: maxPage
      });
    });
  })
})

router.get('/users_deals', (req, res) => {
  if (!req.session.logined) res.send('<script>location.href="/login"</script>');
  const limit = 5;
  let page = Math.max(1, parseInt(req.query.page));
  page = isNaN(page) ? 1 : page;
  let skip = (page-1) * limit;

  client.query('SELECT * FROM deals LEFT JOIN posts ON deals.postid = posts.id WHERE deals.userid=?', [req.session.userid], (err, cnt) => {
    let count = cnt.length - 1;
    client.query('SELECT * FROM deals LEFT JOIN posts ON deals.postid = posts.id WHERE deals.userid=? ORDER BY created, posts.id DESC LIMIT ?, ?', [req.session.userid, skip, limit], (err, results) => {
      let maxPage = Math.ceil(count/limit);
      res.render("board", {
        logined: req.session.logined,
        login: req.session.userid,
        username: req.session.username,
        posts: results,
        moment: moment,
        users: 'deals',
        currentPage: page,
        maxPage: maxPage
      });
    })
  })
});

router.get('/users_chatting', (req, res) => {
  const opponent = [];
  client.query('SELECT * FROM chatlists LEFT JOIN posts ON chatlists.postid = posts.id WHERE chatlists.postuser=? OR chatlists.dealuser=? ORDER BY chatlists.id', 
  [req.session.userid, req.session.userid], (err, results) => {
    // for (let i = 0; i < results.length; i++) {
    //   if (results[i].postuser != req.session.userid) opponent.push(results[i].postuser);
    //   if (results[i].dealuser != req.session.userid) opponent.push(results[i].dealuser);
    //   console.log('상대 배열', opponent);
    // }
    res.render("users_chatlists", {
      logined: req.session.logined,
      login: req.session.userid,
      username: req.session.username,
      chatlists: results,
      moment: moment
    });
  })
});

router.post('/users_editimg', upload.single('uploadfile'), (req, res) => {
  const body = req.body;
  const file = req.file.filename;
  if(!req.session.logined) res.send('<script>location.href="/login"</script>');
  client.query('SELECT * FROM users WHERE userid=?', [req.session.userid], (err, results) => {
  let pre_userimg = results[0].userimg;
  client.query('UPDATE users SET userimg=? WHERE userid=?', [file, req.session.userid], (err, results)=>{
    if(pre_userimg){
      fs.unlink(path.dirname(__dirname) + '/public/images/uploaded/' + pre_userimg, (err) => {
        console.error(err);
      });
    } 
    res.redirect('/users');
    })
  })
});

module.exports = router;

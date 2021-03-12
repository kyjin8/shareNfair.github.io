var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const ejs = require('ejs');
const path = require('path');
const multer = require('multer');

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

router.get('/', (req, res) => {
    client.query('SELECT * FROM posts ORDER BY id', (err, results) => {
        res.render('create', {login: req.session.userid, posts: results});
    })
});
router.post('/', upload.single('uploadfile'), (req, res) => {
    const body = req.body;
    const file = req.file.filename;
    console.log('req.body', req.body)
    client.query('insert into posts(title, price, description, user_id, img) values(?, ?, ?, ?, ?)', [body.title, body.price, body.description, req.session.userid, file], () => {
        console.log(body.title, body.price, req.session.userid);
    })
    res.redirect('/');
})

module.exports = router;
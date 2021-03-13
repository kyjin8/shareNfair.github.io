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
    if(!req.session.logined) res.send('<script>location.href="/login"</script>');
    client.query('SELECT * FROM posts WHERE id=?',[req.session.id], (err, results) => {
        if(err) console.log(err);
        console.log('id', req.session.id);
        console.log('results', results);
        res.render('create', {logined: req.session.logined, posts: results});
    })
});
router.post('/', upload.single('uploadfile'), (req, res) => {
    const body = req.body;
    const file = req.file.filename;
    console.log('req.body', req.body)
    client.query('UPDATE posts SET title=?, price=?, description=?, img=? WHERE ', [body.title, body.price, body.description, file], () => {
        console.log(body.title, body.price);
    })
    res.redirect('/products');
});

module.exports = router;
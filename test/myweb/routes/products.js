var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const ejs = require('ejs');
const { route } = require('./session');

router.use(session);

router.get('/', function(req, res, next) {
    client.query('select * from posts ORDER BY created', (err, results) => {
        res.render('products', {login: req.session.userid, posts: results})
    })
});
router.get('/:id', function(req, res, next) {
    client.query('select * from posts WHERE id=?', [req.params.id], (err, results) => {
        console.log('id', req.params.id);
        console.log('result', results);
        res.render('products_selected', {login: req.session.userid, posts: results})
    })
});
router.post('/:id', function(req, res) {

})

module.exports = router;

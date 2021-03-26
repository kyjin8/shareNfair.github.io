var express = require('express');
var router = express.Router();
const session = require('./session');
const client = require('./mysql');
const moment = require('moment');

router.use(session);

router.get('/', (req, res) => {
    res.render('search', {
        logined: req.session.logined,
        login: req.session.userid,
        username: req.session.username,
        posts: '',
        moment: moment,
        users: '',
        input: ''
    });
})
router.post('/search_process', (req, res) => {
    let input = req.body.search_input;
    const limit = 5;
    let page = Math.max(1, parseInt(req.query.page));
    page = isNaN(page) ? 1 : page;
    let skip = (page-1) * limit;
    console.log('page', page);
    client.query('SELECT * FROM posts WHERE title LIKE \'%'+input+'%\'', (err, cnt) => {
        let count = cnt.length - 1;
        client.query('SELECT * FROM posts WHERE title LIKE \'%'+input+'%\' LIMIT ?, ?', [skip, limit], (err, results) => {
            let maxPage = Math.ceil(count/limit);
            res.render("search", {
                logined: req.session.logined,
                login: req.session.userid,
                username: req.session.username,
                posts: results,
                moment: moment,
                users: '',
                input: input,
                currentPage: page,
                maxPage: maxPage
            });
        })
    })
})
router.get('/search_process/:page/:input', (req, res) => {
    let input = req.params.input;
    const limit = 5;
    let page = Math.max(1, parseInt(req.params.page));
    page = isNaN(page) ? 1 : req.params.page;
    let skip = (page-1) * limit;
    console.log('page', page);
    console.log('input', input);
    client.query('SELECT * FROM posts WHERE title LIKE \'%'+input+'%\'', (err, cnt) => {
        let count = cnt.length - 1;
        client.query('SELECT * FROM posts WHERE title LIKE \'%'+input+'%\' LIMIT ?, ?', [skip, limit], (err, results) => {
            let maxPage = Math.ceil(count/limit);
            res.render("search", {
                logined: req.session.logined,
                login: req.session.userid,
                username: req.session.username,
                posts: results,
                moment: moment,
                users: '',
                input: input,
                currentPage: page,
                maxPage: maxPage
            });
        })
    })
})
module.exports = router;
var express = require('express');
var router = express.Router();
const client = require('./mysql');

router.get('/', (req, res) => {
    res.render('create');
});
router.post('/', (req, res) => {
    const body = req.body;
    client.query('insert into posts(title, price, description, user_id, )')
})
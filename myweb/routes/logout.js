var express = require('express');
var router = express.Router();
const session = require('./session')
const ejs = require('ejs');
const fs = require('fs')
const path = require('path')

router.use(session)

router.get('/',(req,res,next)=>{
    req.session.destroy(function () {
        req.session
    })
    res.redirect('/');
})

module.exports = router;
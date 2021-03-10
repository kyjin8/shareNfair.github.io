const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));
  

module.exports = app;

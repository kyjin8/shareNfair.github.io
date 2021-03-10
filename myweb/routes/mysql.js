const express = require('express');
const mysql = require('mysql');

const app = express();

const client = mysql.createConnection({
    host: 'shareandfair.cafe24app.com',
    user: 'kyjin8',
    password: 'Qmffhrcpdls1!',
    database: 'kyjin8',
    port: '3306'
});

client.query('use kyjin8')

module.exports = client;

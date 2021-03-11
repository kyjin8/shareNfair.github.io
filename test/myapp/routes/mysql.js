var express = require('express');
const mysql = require('mysql2');

const client = mysql.createConnection({
    user:'root',
    password:'1234',
    database:'kyjin8',
    port: 3307
});

client.query('use kyjin8')

module.exports = client;
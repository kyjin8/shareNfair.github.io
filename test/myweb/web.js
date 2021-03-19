#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require("./app");
var debug = require("debug")("myapp:server");
var http = require("http");
const { isObject } = require("util");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "8001");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

// socket
const socketIO = require("socket.io");
const moment = require('moment');
const client = require("./routes/mysql");
const session = require('./routes/session');

const io = socketIO(server);

let roomNum = null;
io.on("connection", (socket) => { //고쳤음
  console.log('client 접속했습니다.')
  socket.on('joinroom', (data)=>{
    roomNum = data.room;
    socket.join(roomNum);
    console.log('roomNum : ', roomNum);
    io.sockets.in(roomNum).emit('joinroom', {});
  })
  socket.on('recording', (data) => {
    const {name, postuser, dealuser, postid} = data;
    let pu_connected = 0;
    let du_connected = 0;
    if(name == postuser) pu_connected = 1;
    else if(name == dealuser) du_connected = 1;
    console.log('게시물작성자 구매희망자', name == postuser, name == dealuser);
    client.query('SELECT * FROM chat LEFT JOIN chatlists ON chat.listNo = chatlists.id WHERE postuser = ? AND dealuser = ? AND chat.postid = ? ORDER BY chat.id', [postuser, dealuser, postid], (err, results) => {
      const chat_record = results;
      console.log('채팅내역 불러오기', chat_record);
      io.sockets.in(roomNum).emit('recording', {
        chat_record,
        pu_connected,
        du_connected
      })
    })
  })
  socket.on('chatting', (data)=>{
    console.log('서버', data);
    let {name, msg, time} = data;
    time = moment(time).format("h:mm A");
    io.sockets.in(roomNum).emit('chatting', {
      name, 
      msg, 
      time
    })
  })
  socket.on('process', (data)=>{ //고쳤음
    let {name, msg, time, postuser, dealuser, postid} = data;
    console.log('과정', data);
    client.query('SELECT * FROM chatlists WHERE postuser = ? AND dealuser = ? AND postid = ?', [postuser, dealuser, postid], (err, results) => {
      const listNo = results[0].id;
      client.query('INSERT INTO chat(sender, chat_context, chat_created, postid, listNo) VALUES(?, ?, ?, ?, ?)', [name, msg, time, postid, listNo]);
    })
  })
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => console.log(`server is running ${port}`));
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

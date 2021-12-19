const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
var CryptoJS = require('crypto-js');

require('dotenv').config();
require('./db');

const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users');
const { User, Chat } = require('./utils/model');
const { ROOMS_NAME, ROOMS } = require('./utils/constant');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.get('/data', (req, res) => {
  console.log('dgdfg');
  res.sendFile('public/index.html', { root: __dirname });
  // res.send(express.static(path.+join(__dirname, 'public')));
});
// Run when client connects
try {
  io.on('connection', (socket) => {
    console.log('CCCCCCCCCCC');
    try {
      socket.on('joinRoom', async ({ name, room }) => {
        try {
          const user = userJoin(socket.id, name, room);
          console.log(ROOMS.indexOf(user.room));
          if (ROOMS.indexOf(user.room) == 0) {
            if (process.env.NAME.indexOf(user.name) < 0) {
              socket.emit('out');
            }
          }
          if (ROOMS.indexOf(user.room) < 0) {
            user.room = 'MSG ME';
          } else {
            user.room = ROOMS_NAME[ROOMS.indexOf(user.room)];
          }
          //join room
          socket.join(user.room);

          // Welcome current user
          socket.emit('info', formatMessage(user.name, 'Welcome to Msg Me!'));

          // Broadcast when a user connects
          socket.broadcast
            .to(user.room)
            .emit('info', formatMessage(user.name, `joined`));

          // Send users and room info
          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
          });

          //create user if it new
          User.findOne({ name: name }, async (err, data) => {
            if (!data) {
              User.create(user);
            }
          });
        } catch (error) {
          if (socket.id) {
            socket.emit('out');
          }
          //console.log('errror5');
        }
      });
      // Listen for chatMessage
      socket.on('chatMessage', async (msg) => {
        try {
          const user = getCurrentUser(socket.id);
          socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(user.name, msg));
          let room = ROOMS.indexOf(user.room);
          //create chat
          User.findOne({ name: user.name }, async (err, data) => {
            if (data) {
              // Encrypt
              msg = CryptoJS.AES.encrypt(msg, process.env.HASH).toString();
              Chat.create({ userId: data._id, sId: user.id, msg, room });
            }
          });
        } catch (error) {
          if (socket.id) {
            socket.emit('out');
          }
        }
      });
      // typing status
      socket.on('typing', (msg) => {
        try {
          const user = getCurrentUser(socket.id);
          socket.broadcast
            .to(user.room)
            .emit('typing', `${user.name} is typing.......`);
        } catch (error) {
          if (socket.id) {
            socket.emit('out');
          }
        }
      });
      socket.on('nottyping', (msg) => {
        try {
          const user = getCurrentUser(socket.id);
          socket.broadcast.to(user.room).emit('nottyping');
        } catch (error) {
          if (socket.id) {
            socket.emit('out');
          }
        }
      });

      // Runs when client disconnects
      socket.on('disconnect', () => {
        try {
          const user = userLeave(socket.id);
          if (user) {
            // Broadcast when a user disconnect
            io.to(user.room).emit('info', formatMessage(user.name, `has left`));
            // Send new users list in room
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room),
            });
          }
        } catch (error) {
          if (socket.id) {
            socket.emit('out');
          }
          //console.log('errror3');
        }
      });
    } catch (error) {
      if (socket.id) {
        socket.emit('out');
      }
      //console.log('errror2');
    }
  });
} catch (error) {
  console.log('errror1');
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

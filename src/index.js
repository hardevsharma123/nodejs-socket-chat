const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUserInRoom, getAllUsers} = require('./utils/users');
const port = process.env.PORT || 3000;


const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const server = http.createServer(app);
const io = socketio(server);
const users = getAllUsers();
console.log(users);

let message = "Welcome!";
io.on('connection', (socket) => {
    console.log('New Connection');
    
    socket.on('join', (options, callback) => {
        const user = addUser( {id:socket.id, ...options} );
        if(user.error){
            callback(user.error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome!', 'Admin'));
        socket.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        });
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, user.username));
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(message, user.username));
            callback(undefined, 'OK');
        }
    });
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, user.username));
            socket.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    });

    socket.on('sendLocation', (location) => {
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('LocationMessage', generateLocationMessage(`http://google.com/maps?q=${location.latitude},${location.longitude}`, user.username));
        }
    });
});

server.listen(port, () => {
    console.log('Server is listening on port '+port);
});
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', async (req,res) => {
    const { v4: uuidv4 } = await import('uuid');
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room', (req, res) => {
    console.log(req.params);
    
    res.render('room', { roomId: req.params.room});
})

io.on('connection', socket => {
    socket.on('join-room',(roomId, userId ) => {
        socket.join(roomId, userId);
        socket.to(roomId).emit('user-connected', userId); // notify other users in the room


        socket.on('message', message => {
            // broadcast message to everyone ELSE in the room (do not echo back to sender)
            socket.to(roomId).emit('createMessage', message);
        });
    })

})

server.listen(3030);

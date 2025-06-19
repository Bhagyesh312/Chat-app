const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
    }
});
const { exec } = require('child_process');
const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        io.emit('user-list', users);
        
        exec(`python demo.py "Hello ${name}, welcome to the chat!"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error speaking: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`Spoken: Hello ${name}`);
        });
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    socket.on('private-message', ({ toSocketId, message }) => {
        const fromName = users[socket.id];
        io.to(toSocketId).emit('receive-private', { from: fromName, message: message });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        io.emit('user-list', users);
    });
});
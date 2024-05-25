import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000',
    }, 
})


let users = [];

const addUser = (userData, socketId) => {
    delete userData.token;
    !users.some(user => user.id === userData.id) && users.push({ ...userData, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (receiverId) => {
    return users.find(user => user.id === receiverId);
}

io.on('connection',  (socket) => {
    socket.on("addUser", userData => {
        addUser(userData, socket.id);
        io.emit("getUsers", users);
})

    //send message
    socket.on('sendMessage', (data) => {
        const user = getUser(data.receiverId);
        // console.log("found user: ",user);
        io.to(user.socketId).emit('getMessage', data)
    })

    //disconnect
    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
});

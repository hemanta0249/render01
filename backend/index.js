require("dotenv").config();
const connectToMongo = require('./db');
const express = require("express");
const {Server} = require("socket.io");
const cors = require('cors');
// const fs = require('fs');

connectToMongo();

const app = express();
const io = new Server();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

const ETS = new Map();
const STE = new Map();

io.on("connection", (socket) =>{
    socket.on("join-room", (data)=>{
        console.log(data);
        const {room} = data;
        console.log(room);
        // ETS.set(email, socket.id);
        // STE.set(socket.id, email);
        io.to(room).emit("user-joined", {id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("joined-room", data);
    })

    socket.on("call-user", (data)=>{
        const {to, offer} = data;
        io.to(to).emit('incoming-call', {from: socket.id, offer});
    })

    socket.on("call-accepted", (data)=>{
        const {to, ans} = data;
        io.to(to).emit("call-accepted", {from: socket.id, ans});
    })

    socket.on("nego-needed", (data)=>{
        const {offer, to} = data;
        io.to(to).emit("nego-needed", {from: socket.id, offer})
    })

    socket.on("nego-done", (data)=>{
        const {to, ans} = data;
        io.to(to).emit("nego-final", {from: socket.id, ans});
    })

    socket.on("send",(data)=>{
        const {message} = data;
        console.log(message);
        socket.broadcast.emit("incomingMsg",{message})
    })
})

app.get('/', (req, res)=>{
    res.send("hello world");
})

app.use('/api/auth', require('./routes/auth'));

app.listen(port,()=>{
    console.log(`running on the port ${port}`);
})

// var key = fs.readFileSync("../key").toString();
// console.log(key);


io.listen(8080,{
    cors : true
});
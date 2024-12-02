import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { mongoConfig } from "./config.js";
import { chatModel } from "./chatSchema.js";
import open from "open";
import path from "path";
const app = express();
// Create http server
const server = new http.createServer(app);

//set up static files
app.use(express.static("public"))

//set up aroute 
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","home.html"));
});
// Socket configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "PUT", "DELETE"]
    }
});

let rooms = {};

// Listen for events
io.on("connection", (socket) => {
    console.log("Connected");

    // New User
    socket.on("newUser", async (userName,roomId) => {
        socket.userName = userName;
        socket.roomId = roomId;
        socket.join(roomId);
        
        //get the connected user count to room
        const clientsInRoom = io.sockets.adapter.rooms.get(roomId); // Get the room
        const count = clientsInRoom ? clientsInRoom.size : 0; // Get the count of users in the room
        //add the user to rooms array
        //check if room exists
        if(rooms.hasOwnProperty(roomId)){
            rooms[roomId].push(userName);
        }else{
            rooms[roomId] = [userName];
        }

        //load prev msges if any
        // Calculate the timestamp for 30 minutes ago
        const now = Date.now();
        const thirtyMinutesAgo = now - 30 * 60 * 1000;

        // Query the chatModel for messages created in the last half hour
        let prevMsg = await chatModel.find({
            createdAt: {
                $gte: new Date(thirtyMinutesAgo) // Use $gte to find messages created after this timestamp
            },roomId:roomId
            });
        //emit the messages
        prevMsg.map((msg)=>{
        socket.emit("msgAdded", msg);
        })
        // Emit to all clients that a new user has joined
        io.to(roomId).emit("userAdded", userName, count,rooms[roomId]);
        
    });

    // On receiving a new message
    socket.on("newMsg", async (message,roomId) => {
        try {
            // Save the new message
            let newmsg = chatModel({
                text: message,
                createdAt: new Date(),
                user: socket.userName,
                roomId
            });
            await newmsg.save();

            // Broadcast the message to all connected clients
            io.to(roomId).emit("msgAdded", newmsg);
        } catch (error) {
            console.log(error);
        }
    });

    //typing
    socket.on("typing",(name)=>{
        io.emit("userTyping",name);
    })
    //stopped typing
    socket.on("stopTyping",(name)=>{
        io.emit("userStoppedTyping",name);
    })
    // On disconnect
    socket.on("disconnect", () => {
        let connectedUsers = 0;
        console.log("Disconnected");
        io.to(socket.roomId).emit("userLeft", socket.userName,socket.roomId); // Notify other clients of disconnection
    });
});

// Set up the server
server.listen(3000, () => {
    console.log("Server is listening at 3000");
    mongoConfig();
    open("http://localhost:3000");
});

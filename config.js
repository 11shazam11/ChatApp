import mongoose from "mongoose";

export const mongoConfig = ()=>{
    mongoose.connect("mongodb://localhost:27017/chatting").then(()=>{
        console.log("Connected to mongoDB");
    })
}
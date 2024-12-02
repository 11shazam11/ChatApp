import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    text:String,
    createdAt:Date,
    user:String,
    roomId:Number
});

export const chatModel = mongoose.model("chatInfo",chatSchema);
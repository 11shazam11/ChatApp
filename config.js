import mongoose from "mongoose";

export const mongoConfig = ()=>{
    mongoose.connect("mongodb+srv://dhumneabhay:l4FVmLTfsLNRZDvv@cluster0.uoo3q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(()=>{
        console.log("Connected to mongoDB");
    })
}

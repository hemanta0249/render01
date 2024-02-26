const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://hemantarora028:IkELLM6yvHEgwkXG@callexa02.xxoamxb.mongodb.net/?retryWrites=true&w=majority&appName=callexa02";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI);
    console.log("connected to mongo successfully");
}

module.exports = connectToMongo;
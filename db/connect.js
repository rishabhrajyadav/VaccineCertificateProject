const mongoose = require("mongoose")
require('dotenv').config(); 

const connect = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connection Achieved from Mongoose !!")
    } catch (error) {
        console.log(`${error} : Connection Failed From Mongoose !!`)
    }    
}

module.exports = connect;
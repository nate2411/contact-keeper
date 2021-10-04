const config = require("config");
const mongoose = require('mongoose');
const database = config.get("mongoURI");
// FUNCTION WILL CONNECT TO THE DATABASE
const connectDB = async () => {
    try {
        // PASS IN THE database AND AN OBJECT FOR CONFIGURATION OPTIONS
        await mongoose.connect(database, {
            useNewUrlParser: true,
        })      
        
        console.log("mongo database connected...");
    } catch(err) {
        // LOG THE ERROR MESSAGE
        console.error(err.message);

        // EXIT THE PROCESS WITH FAILURE
        process.exit(1);
    }
}

module.exports = connectDB;
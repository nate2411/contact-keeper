const mongoose = require('mongoose');

// CREATE A USER SCHEMA 
const UserSchema = mongoose.Schema({
    // DEFINE THE PROPERTIES WE WANT THE USER TO HAVE
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("user", UserSchema);
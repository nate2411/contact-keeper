const mongoose = require('mongoose');

// CREATE A CONTACT SCHEMA 
const ContactSchema = mongoose.Schema({
    // BASICALLY THE FOREIGN KEY
    // EACH CONTACT WILL BE ASSOCIATED WITH A USER
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    // DEFINE THE PROPERTIES WE WANT THE CONTACT TO HAVE
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
    },
    type: {
        type: String,
        default: "personal"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("contact", ContactSchema);
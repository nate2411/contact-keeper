const { Router } = require("express");
const { check, validationResult } = require('express-validator');

// CUSTOM MODULES
const User = require("../models/User");
const auth =  require("../middleware/auth");
const Contact = require("../models/Contact");


const router = Router();


// ROUTE TO GET ALL USERS CONTACTS
router.get("/", auth, async (request, response) => {
    try {
        // GET ALL CONTACTS THAT HAVE THE SAME USER AS THE PROVIDED id AND SORT THEM BY MOST RECENT ADDITION
        let contacts = await Contact.find({ user: request.user.id }).sort({ date: -1 });

        response.json(contacts);
    } catch (error) {

        console.error(error.message);
        response.status(500).send("Server error")
    }
})

// ROUTE TO ADD NEW CONTACT
router.post("/", 
    // BOTH THE auth MIDDLEWARE AND express-validator NEED O BE THE 2ND PARAMETER, THAT IS SOLVED BY PUTTING THEM IN AN ARRAY
    [
        auth,
        // CHECK IF name IS NOT EMPTY
        check("name", "name is required").not().isEmpty()
    ],
    async (request, response) => {
        // GET ALL THE ERRORS
        const errors = validationResult(request);

        // CHECK IF THERE ARE ERRORS
        if(!errors.isEmpty()) {
            // RETURN A 400 STATUS CODE BECAUSE THE PROVIDED DETAILS ARE INCORRECT
            return response.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone_number, type } = request.body;

        try {
            // CREATE A NEW CONTACT WITH THE PROVIDED DETAILS
            let new_contact = new Contact({ user: request.user.id , name, email, phone_number, type });
            // SAVE THE CONTACT TO THE DATABASE
            let contact =  await new_contact.save();

            response.json(contact);
        } catch (error) {

            console.error(error.message);
            response.status(500).send("Server error")
        }
    }
)

// ROUTE TO UPDATE A CONTACT BASED ON THE id
router.put("/:id", auth, async (request, response) => {
    let contact_fields = {};
    let { name, email, phone_number, type } = request.body;

    // BUILD THE contact_fields OBJECT
    if (name) contact_fields.name = name;
    if (type) contact_fields.type = type;
    if (email) contact_fields.email = email;
    if (phone_number) contact_fields.phone_number = phone_number;

    try {
        // GET THE contact FROM THE DATABASE WITH THE PROVIDED id
        let contact = await Contact.findById(request.params.id);
        if (!contact) return response.status(404).json({ msg: "contact not found" });

        // CHECK IF THE USER OWNS THE CONTACT THAT THEY WANNA UPDATE
        if (contact.user.toString() !== request.user.id) return response.status(404).json({ msg: "user not authorised to update" });

        contact = await Contact.findByIdAndUpdate(
            // PROVIDE id OF CONTACT TO UPDATE
            request.params.id, 
            // PROVIDE THE FIELDS TO UPDATE
            { $set: contact_fields },
            // IF THE CONTACT DOES NOT EXIST, CREATE IT
            { new: true }
        );

        response.json(contact);
    } catch (error) {
        
        console.error(error.message);
        response.status(500).send("Server error")
    }
})

// ROUTE DELETE A CONTACT BASED ON THE id
router.delete("/:id", auth, async (request, response) => {
    try {
        // GET THE contact FROM THE DATABASE WITH THE PROVIDED id
        let contact = await Contact.findById(request.params.id);
        if (!contact) return response.status(404).json({ msg: "contact not found" });

        // CHECK IF THE USER OWNS THE CONTACT THAT THEY WANNA UPDATE
        if (contact.user.toString() !== request.user.id) return response.status(404).json({ msg: "user not authorised to update" });

        // PROVIDE id OF CONTACT TO UPDATE
        await Contact.findByIdAndRemove(request.params.id);

        response.json({ msg: "contact deleted" });
    } catch (error) {
        
        console.error(error.message);
        response.status(500).send("Server error")
    }
})


// EXPORT THE router
module.exports = router;
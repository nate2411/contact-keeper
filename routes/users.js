// GET NEEDED REQUIREMENTS
const config =  require("config");
const bcrypt =  require("bcryptjs");
const jwt =  require("jsonwebtoken");
const { Router, request } = require("express");
const { check, validationResult } = require('express-validator');

// CUSTOM MODULES
const User = require("../models/User");


const router = Router();


// ROUTE TO REGISTER A USER
router.post("/",
    [
        // CHECK IF name IS NOT EMPTY
        check("name", "name is required").not().isEmpty(),
        // CHECK IF EMAIL IS VALID
        check("email", "email is not valid").isEmail(),
        // CHECK IF PASSWORD IS MORE THAT 6 CHARACTERS
        check("password", "please enter a password with 6 or more characters").isLength({ min: 6 })
    ],
    async (request, response) => {
        // GET ALL THE ERRORS
        const errors = validationResult(request);

        // CHECK IF THERE ARE ERRORS
        if(!errors.isEmpty()) {
            // RETURN A 400 STATUS CODE BECAUSE THE PROVIDED DETAILS ARE INCORRECT
            return response.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = request.body;

        try {
            // FIND A USER WITH THE SAME email AS PROVIDED
            let user = await User.findOne({ email });
        
            if (user) {
                return response.status(400).json({ msg: "user exists" });
            }

            user = new User({
                name, email, password
            });

            // ENCRYPT THE PASSWORD BY USING A salt
            let salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt)

            // SAVE THE USER TO THE DATABASE
            await user.save();

            // CREATE A PAYLOAD TO SEND IN THE JWT TOKEN
            let payload = {
                user: {
                    id: user.id
                }
            }

            // SIGN THE PAYLOAD TO CREATE A TOKEN
            jwt.sign(
                // PASS IN THE PAYLOAD
                payload, 
                // GET THE jwt_secret FROM THE CONFIG FILE
                config.get("jwt_secret"), 
                // SET THE EXPIRY TIME FOR THE TOKEN
                { expiresIn: 360000 }, 
                // CALLBACK FUNCTION WILL RUN WHEN WE GET AN ERROR OR THE TOKEN
                (error, token) => {
                    // IF THERE IS AN ERROR, THROW THE ERROR 
                    if (error) throw error;
                    // IF THERE IS NO ERROR, SSEND THE TOKEN 
                    response.json({ token });
                }
            )
        } catch (error) {
            console.error(error.message);

            response.status(500).send("Server error")
        }
    }
);


// EXPORT THE ROUTER
module.exports = router;
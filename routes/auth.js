// GET NEEDED REQUIREMENTS
const config =  require("config");
const bcrypt =  require("bcryptjs");
const jwt =  require("jsonwebtoken");
const { Router, request } = require("express");
const { check, validationResult } = require('express-validator');

// CUSTOM MODULES
const User = require("../models/User");
const auth =  require("../middleware/auth");


const router = Router();


// PROTECTED ROUTE TO GET THE LOGGED IN USER - SHOWN BY THE 2ND PARAMETER (auth)
router.get("/", auth, async (request, response) => {
    try {
        // request.user WAS SET IN THE auth MIDDLEWARE...THAT IS WHY WE HAVE ACCESS TO IT HERE
        let user =  await User.findById(request.user.id).select("-password");
        response.json( user );

    } catch (error) {
        console.error(error.message);
        response.status(500).send("Server error")
    }
})

// AUTHENTICATE USER AND GET TOKEN
router.post("/", 
    [
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

        let { email, password } = request.body;

        try {
            // FIND THE USER THAT HAS THE SAME EMAIL
            let user = await User.findOne({ email });

            if(!user) return response.status(400).json({ msg: "invalid credentials" })
            
            // CJECK IF THE PROVIDED password MACHES THE HASH PASSWORD IN THE DATABASE   
            const is_match = await bcrypt.compare(password, user.password);
            if (!is_match) return response.status(400).json({ msg: "invalid credentials" })

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
)


// EXPORT THE ROUTER
module.exports = router;
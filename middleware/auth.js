const config =  require("config");
const jwt =  require("jsonwebtoken"); 


module.exports = function (request, response, next) {
    // GET THE token FROM THE HEADER
    let token = request.header("x-auth-token");

    // CHECK IF token DOES NOT EXISTS
    if (!token) return response.status(401).json({ msg: "no token, authorisation denied" })

    try {
        // VERIFY THE TOKEN
        let decoded =  jwt.verify(token, config.get("jwt_secret"));

        // GET THE USER FROM THE decoded PAYLOAD
        request.user = decoded.user;
        next();
    } catch (error) {
        console.error(error.message);
        response.status(401).json({ msg: "token is not valid" });
    }
};

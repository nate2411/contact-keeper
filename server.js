// GET NEEDED REQUIREMENTS
const express = require("express");
const connectDB = require("./config/db");

// LOOK FOR AN ENVIROMENT VARIABLE CALLED PORT(USED IN PRODUCTION) OR JUST USE 5000
const port = process.env.port || 5000;


// INITIALISE THE EXPRESS APP
app = express();

// MIDDLEWARE TO CONVERT RESPONSES TO JSON
app.use(express.json({ extended: false }));

// CONNECT TO DATABASE
connectDB();

// DEFINE ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/contacts", require("./routes/contacts"));


// LISTEN FOR REQUESTS ON PORT
app.listen(port, () => console.log(`Server listening on port: ${port}`));
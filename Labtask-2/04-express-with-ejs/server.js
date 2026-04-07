const express = require("express");
const path = require("path");

const app = express();

// FIX: set correct views folder
app.set("views", path.join(__dirname, "views"));

// EJS
app.set("view engine", "ejs");

// static
app.use(express.static("public"));

// route
app.get("/", (req, res) => {
    res.render("homepage");
});

// server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
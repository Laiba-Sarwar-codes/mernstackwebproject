const express = require("express");
const app = express();
const PORT = 3000;

// Tell Express to use EJS for rendering pages
app.set("view engine", "ejs");

// Serve everything inside /public as static files
app.use(express.static("public"));

// Home route — renders views/index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
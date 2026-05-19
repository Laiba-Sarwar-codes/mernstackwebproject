const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const salesRoutes = require("./routes/salesRoutes");
const { bootstrapDatabase } = require("./config/bootstrap");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MONGO_URI is missing. Make sure the file is named exactly .env and contains MONGO_URI.");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
// Existing pages are full EJS documents, so layouts are enabled only for views that pass a layout option.
app.set("layout", false);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API is mounted before session middleware so JWT endpoints remain stateless.
app.use("/api/v1", apiRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(flash());

app.use(async (req, res, next) => {
  try {
    if (req.session.user?.id) {
      const user = await User.findById(req.session.user.id).select("name email role");

      if (user) {
        req.session.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      } else {
        delete req.session.user;
      }
    }
  } catch (error) {
    delete req.session.user;
  }

  res.locals.currentUser = req.session.user || null;
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");

  if (req.query.loggedOut === "1") {
    res.locals.successMessages.push("You have successfully logged out.");
  }

  next();
});

app.get("/", (req, res) => {
  res.render("index");
});

app.use(authRoutes);
app.use(salesRoutes);
app.use("/products", productRoutes);
app.use("/admin", adminRoutes);

async function startServer() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected successfully.");

    await bootstrapDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Products page: http://localhost:${PORT}/products`);
      console.log(`Login page: http://localhost:${PORT}/login`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
      console.log(`Sales dashboard: http://localhost:${PORT}/sales`);
      console.log(`REST API: http://localhost:${PORT}/api/v1/products`);
    });
  } catch (error) {
    console.error("Failed to start application:", error.message);
    console.error("Check MONGO_URI, Atlas IP Access List, database user/password, and internet/DNS connection.");
    process.exit(1);
  }
}

startServer();

const express = require("express");
const User = require("../models/User");
const { isLoggedIn } = require("../middleware/authMiddleware");

const router = express.Router();
const VALID_ROLES = ["customer", "admin"];

function saveUserInSession(req, user) {
  req.session.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function getRequestedRole(value) {
  return VALID_ROLES.includes(value) ? value : "customer";
}

function getRedirectForRole(role) {
  return role === "admin" ? "/admin" : "/products";
}

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/profile");
  res.render("auth/register", { formData: { role: "customer" } });
});

router.post("/register", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const requestedRole = getRequestedRole(req.body.role);
    const adminSecretCode = process.env.ADMIN_SECRET_CODE;
    const submittedAdminCode = req.body.adminSecretCode?.trim();

    const formData = { name, email, role: requestedRole };

    if (!name || !email || !password || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.render("auth/register", { formData });
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters.");
      return res.render("auth/register", { formData });
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.render("auth/register", { formData });
    }

    if (requestedRole === "admin") {
      if (!adminSecretCode) {
        req.flash("error", "Admin registration is disabled because ADMIN_SECRET_CODE is not configured.");
        return res.render("auth/register", { formData });
      }

      if (!submittedAdminCode || submittedAdminCode !== adminSecretCode) {
        req.flash("error", "Invalid admin secret code. Admin accounts require authorization.");
        return res.render("auth/register", { formData });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "This email is already registered. Please log in instead.");
      return res.render("auth/register", { formData });
    }

    await User.create({ name, email, password, role: requestedRole });

    const accountType = requestedRole === "admin" ? "Admin" : "Customer";
    req.flash("success", `${accountType} account created successfully. Please log in.`);
    res.redirect("/login");
  } catch (error) {
    const message = error.code === 11000 ? "This email is already registered." : "Unable to register. Please try again.";
    req.flash("error", message);
    res.render("auth/register", {
      formData: {
        name: req.body.name,
        email: req.body.email,
        role: getRequestedRole(req.body.role),
      },
    });
  }
});

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect(getRedirectForRole(req.session.user.role));
  res.render("auth/login", { formData: { loginAs: "customer" } });
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const loginAs = getRequestedRole(req.body.loginAs);
    const formData = { email, loginAs };

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.render("auth/login", { formData });
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.render("auth/login", { formData });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      req.flash("error", "Invalid email or password.");
      return res.render("auth/login", { formData });
    }

    if (user.role !== loginAs) {
      const message = loginAs === "admin"
        ? "This account is not an admin account. Please log in as Customer or use an authorized admin account."
        : "This account is an admin account. Please select Admin to continue.";
      req.flash("error", message);
      return res.render("auth/login", { formData });
    }

    req.session.regenerate((error) => {
      if (error) {
        req.flash("error", "Unable to start your login session. Please try again.");
        return res.render("auth/login", { formData });
      }

      saveUserInSession(req, user);
      req.flash("success", `Welcome back, ${user.name}!`);
      return res.redirect(getRedirectForRole(user.role));
    });
  } catch (error) {
    req.flash("error", "Unable to log in. Please try again.");
    res.render("auth/login", {
      formData: {
        email: req.body.email,
        loginAs: getRequestedRole(req.body.loginAs),
      },
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login?loggedOut=1");
  });
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select("name email role");

    if (!user) {
      req.session.destroy(() => res.redirect("/login"));
      return;
    }

    saveUserInSession(req, user);
    res.locals.currentUser = req.session.user;
    res.render("profile");
  } catch (error) {
    req.flash("error", "Unable to load profile.");
    res.redirect("/products");
  }
});

router.get("/checkout", isLoggedIn, (req, res) => {
  res.render("checkout");
});

module.exports = router;

const User = require("../models/User");

function redirectToLogin(req, res) {
  req.flash("error", "Please log in first.");
  return res.redirect("/login");
}

function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return redirectToLogin(req, res);
}

async function isAdmin(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return redirectToLogin(req, res);
    }

    const user = await User.findById(req.session.user.id).select("name email role");

    if (!user || user.role !== "admin") {
      req.flash("error", "Access denied. Admins only.");
      return res.redirect("/products");
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    req.flash("error", "Unable to verify admin access. Please log in again.");
    return res.redirect("/login");
  }
}

module.exports = { isLoggedIn, isAdmin };

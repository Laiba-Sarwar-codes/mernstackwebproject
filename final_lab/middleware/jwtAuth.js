const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: missing Bearer token in Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: token was not provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: decoded.user_id,
      id: decoded.user_id,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return next();
  } catch (error) {
    const message = error.name === "TokenExpiredError"
      ? "Forbidden: token has expired. Please log in again."
      : "Forbidden: invalid token.";

    return res.status(403).json({
      success: false,
      message,
    });
  }
}

module.exports = { verifyToken };

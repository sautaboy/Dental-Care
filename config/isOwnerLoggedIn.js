const jwt = require("jsonwebtoken");

const isOwnerLoggedIn = (req, res, next) => {
    const token = req.cookies.clinicToken;

    if (!token) {
        req.isOwnerLoggedIn = false;  // No token, consider user not logged in
        return next();  // Continue without redirecting
    }

    try {
        // Verify the token
        let data = jwt.verify(token, process.env.JWT_SECRET || "clinic");
        req.clinic = data;
        req.isOwnerLoggedIn = true;
    } catch (error) {
        console.error("Invalid token:", error);
        req.isOwnerLoggedIn = false;  // Invalid token, consider user not logged in
    }

    next();  // Continue to the next middleware or route
};

module.exports = isOwnerLoggedIn;

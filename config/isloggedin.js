// const jwt = require("jsonwebtoken");


// // midlleware to cheack whether the developer is logged in or not
// const isLoggedIn = (req, res, next) => {
//     const token = req.cookies.token;
//     // Check if token is provided
//     if (!token) {
//         return res.redirect("/admin/developer/login")
//     }
//     try {
//         // Verify the token and attach the user data to the request object
//         let data = jwt.verify(token, process.env.JWT_SECRET || "developer");
//         req.developer = data;
//         req.isLoggedIn = true;
//     } catch (error) {
//         console.error("Invalid token:", error);
//         res.status(403).send("Invalid or expired token. Please log in again.");
//     }
// }
// module.exports = isLoggedIn


const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;  // Check if token exists
    if (!token) {
        // If no token, set isLoggedIn to false and move on
        req.isLoggedIn = false;
        return next();
    }

    try {
        // Verify the token
        let data = jwt.verify(token, process.env.JWT_SECRET || "developer");
        req.developer = data;
        req.isLoggedIn = true;
    } catch (error) {
        console.error("Invalid token:", error);
        req.isLoggedIn = false;  // Invalid token, consider user not logged in
    }

    next();  // Continue to the next middleware or route
};

module.exports = isLoggedIn;

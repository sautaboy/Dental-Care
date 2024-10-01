const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const clinicModel = require("../models/clinic")
const developerModel = require("../models/developer")
const upload = require("../config/multer");
const { error } = require('console');

router.use(express.static(path.join(__dirname, 'public')));








// this is fro developer 
router.get("/developer", isLoggedIn, async (req, res) => {
    let developer = await developerModel.findOne({ email: req.developer.email })
    res.render("developer", { developer })
})





// route to create developer
router.post("/createDeveloper", isLoggedIn, async (req, res) => {
    let { fullName, email, password, phoneNumber, username } = req.body;

    let developer = await developerModel.findOne({ email })
    if (developer) return res.send("Developer already exits")



    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);


    // Create the new user
    await developerModel.create({
        fullName,
        email,
        password: hash,
        phoneNumber,
        username
    });
    res.status(201).send("Developer Registered");
})

router.get("/developer/login", async (req, res) => {
    res.render("login")
})





// route to login
router.post("/developer/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Find the user by email
        let developer = await developerModel.findOne({ email });
        if (!developer) return res.status(404).send("Developer not found");

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, developer.password);
        if (isMatch) {
            // Generate JWT token
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET || 'developer');

            // Set token as cookie
            res.cookie("token", token);

            // Redirect to profile page on success
            return res.redirect("/admin/developer");
        } else {
            console.log("Invalid Credentials");
            return res.redirect("/developer/login");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});






// routet to add clinic to 
router.post('/developer/add-clinic', upload.fields([
    { name: 'teamMemberImages', maxCount: 10 },
    { name: 'aboutUsImage', maxCount: 1 },
    { name: 'serviceImages', maxCount: 10 },
    { name: 'carouselImages', maxCount: 10 }
]), async (req, res) => {
    try {
        let alreadyClinic = await clinicModel.findOne({ email: req.body.email })
        if (alreadyClinic) res.send("Clinic Already There and Email should be Different");


        // Generate salt and hash the password
        let password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const clinicData = {
            clinicName: req.body.clinicName,
            email: req.body.email,
            password: hash,
            phoneNumber: req.body.phoneNumber,
            location: req.body.location,
            teamMembers: req.body.teamMembers.map((member, index) => ({
                ...member,
                image: req.files.teamMemberImages[index]?.filename
            })),
            aboutUs: [{
                image: req.files.aboutUsImage[0]?.filename, // Single image for 'About Us'
                paragraphs: req.body.aboutUs.paragraphs.map(para => ({
                    paragraph: para.paragraph // Storing each paragraph
                }))
            }],
            services: req.body.services.map((service, index) => ({
                ...service,
                image: req.files.serviceImages[index]?.filename
            })),
            crausel: req.files.carouselImages.map(file => ({
                image: file.filename
            }))
        };






        const clinic = new clinicModel(clinicData);
        await clinic.save();
        // res.status(201).send('Clinic added successfully!');
        res.send(clinic)
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding clinic');
    }
});


// midlleware to cheack whether the developer is logged in or not
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    // Check if token is provided
    if (!token) {
        return res.redirect("/admin/developer/login")
        // res.redirect("/admin/developer/login")
    }
    try {
        // Verify the token and attach the user data to the request object
        let data = jwt.verify(token, process.env.JWT_SECRET || "developer");
        req.developer = data;
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        res.status(403).send("Invalid or expired token. Please log in again.");
    }
}





// route to logout
router.get("/developer/logout", (req, res) => {
    // Clear the token cookie
    res.clearCookie("token");

    // Redirect to login page
    res.redirect("/admin/developer/login");
});







module.exports = router;

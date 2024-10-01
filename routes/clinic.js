const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");



const clinicModel = require("../models/clinic")
const upload = require("../config/multer");

router.use(express.static(path.join(__dirname, 'public')));




router.get("/clinicOwner/login", async (req, res) => {
    res.render("clinicOwnerLogin")
})









// routet to update clinic
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



router.get("/clinicOwner/login", async (req, res) => {
    res.render("clinicOwnerLogin")
})


router.get("/clinicOwner/update-clinic", isOwnerLoggedIn, async (req, res) => {
    let clinic = await clinicModel.findOne({ email: req.clinic.email })
    res.render("update-clinic", { clinic })
})

router.post("/clinicOwner/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        // Find the user by email
        let clinic = await clinicModel.findOne({ email });
        console.log(clinic)
        if (!clinic) return res.status(404).send("clinic not found");

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, clinic.password);
        if (isMatch) {
            // Generate JWT token
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET || 'clinic');

            // Set token as cookie
            res.cookie("clinic", token);


            // this can be the update 
            res.redirect("/clinic/clinicOwner/update-clinic")
        } else {
            console.log("Invalid Credentials");
            // return res.redirect("/developer/login");
            res.send("error")
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});




function isOwnerLoggedIn(req, res, next) {
    const token = req.cookies.clinic;
    // Check if token is provided
    if (!token) {
        return res.redirect("/clinic/clinicOwner/login")
    }
    try {
        // Verify the token and attach the user data to the request object
        let data = jwt.verify(token, process.env.JWT_SECRET || "clinic");
        req.clinic = data;
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        res.status(403).send("Invalid or expired token. Please log in again.");
    }
}



router.get("/clinicOwner/logout", (req, res) => {
    // Clear the token cookie
    res.clearCookie("clinic");
    // Redirect to login page
    res.redirect("/clinic/clinicOwner/login");
});







module.exports = router;

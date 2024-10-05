const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const clinicModel = require("../models/clinic");
const developerModel = require("../models/developer");
const upload = require("../config/multer");
const isLoggedIn = require("../config/isloggedin");
const isOwnerLoggedIn = require("../config/isOwnerLoggedIn");

const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret'; // Use env variable for secret


// Display developer page
router.get("/developer", isLoggedIn, async (req, res) => {
    try {
        const developer = await developerModel.findOne({ email: req.developer.email });
        if (!developer) throw new Error("Developer not found");
        res.render("developer", { developer });
    } catch (error) {
        console.error("Error fetching developer:", error);
        req.flash("error_msg", "Error fetching developer. Please login again.");
        res.redirect("/admin/developer/login");
    }
});

// Create developer
router.post("/createDeveloper", isLoggedIn, async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, username } = req.body;

        const developer = await developerModel.findOne({ email });
        if (developer) {
            req.flash("error_msg", "Developer already exists.");
            return res.redirect(req.get('Referer') || '/'); // Redirect after setting flash message
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await developerModel.create({
            fullName,
            email,
            password: hash,
            phoneNumber,
            username
        });

        req.flash('success_msg', 'Developer Registered successfully!');
        res.redirect(req.get('Referer') || '/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect(req.get('Referer') || '/');
    }
});

// Render developer login page
router.get("/developer/login", async (req, res) => {
    res.render("login");
});

// Handle developer login

// Example login route
router.post("/developer/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the developer by email
        const developer = await developerModel.findOne({ email });
        if (!developer) return res.status(404).send("Developer not found");

        // Compare password
        const isMatch = await bcrypt.compare(password, developer.password);
        if (isMatch) {
            // Generate JWT token using the secret from .env
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '3h' });

            // Set token as cookie
            res.cookie("token", token, { httpOnly: true });

            // Redirect on success
            return res.redirect("/admin/developer");
        } else {
            return res.redirect("/developer/login");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});


// Add clinic (developer)
router.post('/developer/add-clinic', upload.fields([
    { name: 'teamMemberImages', maxCount: 10 },
    { name: 'aboutUsImage', maxCount: 1 },
    { name: 'serviceImages', maxCount: 10 },
    { name: 'carouselImages', maxCount: 10 }
]), async (req, res) => {
    try {
        const { email, password, clinicName, phoneNumber, location, teamMembers, aboutUs, services } = req.body;

        const alreadyClinic = await clinicModel.findOne({ email });
        if (alreadyClinic) {
            req.flash('error_msg', 'Clinic already exists. Email should be unique.');
            return res.redirect(req.get('Referer') || '/');
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const clinic = await clinicModel.create({
            clinicName,
            email,
            password: hash,
            phoneNumber,
            location,
            teamMembers: teamMembers?.map((member, index) => ({
                ...member,
                image: req.files.teamMemberImages?.[index]?.filename || ''
            })),
            aboutUs: [{
                image: req.files.aboutUsImage?.[0]?.filename || '',
                paragraphs: aboutUs?.paragraphs?.map(para => ({ paragraph: para.paragraph })) || []
            }],
            services: services?.map((service, index) => ({
                ...service,
                image: req.files.serviceImages?.[index]?.filename || ''
            })),
            carousel: req.files.carouselImages?.map(file => ({ image: file.filename })) || []
        });

        const token = jwt.sign({ id: clinic._id, email: clinic.email }, jwtSecret, { expiresIn: "3h" });
        res.cookie("clinicToken", token, { httpOnly: true, maxAge: 3 * 60 * 60 * 1000 });

        req.flash('success_msg', 'Clinic added successfully');
        return res.redirect(req.get('Referer') || '/');
    } catch (error) {
        console.error("Error adding clinic:", error);
        req.flash('error_msg', 'Error adding clinic');
        res.redirect(req.get('Referer') || '/');
    }
});

// Developer logout
router.get("/developer/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// Clinic owner routes

// Clinic owner login page
router.get("/clinicOwner/login", (req, res) => {
    res.render("clinicOwnerLogin");
});

// Handle clinic owner login
router.post("/clinicOwner/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const clinic = await clinicModel.findOne({ email });
        if (!clinic) {
            req.flash('error_msg', 'Clinic not found');
            return res.redirect("/clinicOwner/login");
        }

        const isMatch = await bcrypt.compare(password, clinic.password);
        if (isMatch) {
            const token = jwt.sign({ email: clinic.email }, jwtSecret, { expiresIn: "3h" });
            res.cookie("clinicToken", token, { httpOnly: true, maxAge: 7 * 60 * 60 * 1000 });
            return res.redirect("/admin/clinicOwner/update-clinic");
        } else {
            req.flash('error_msg', 'Invalid Credentials');
            return res.redirect("/clinicOwner/login");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});

// Update clinic (for clinic owner)
router.get("/clinicOwner/update-clinic", isOwnerLoggedIn, async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ email: req.clinic.email });
        if (!clinic) {
            req.flash('error_msg', 'Clinic not found');
            return res.redirect('/');
        }
        res.render("update-clinic", { clinic, isOwnerLoggedIn: req.isOwnerLoggedIn });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Clinic owner logout
router.get("/clinicOwner/logout", (req, res) => {
    res.clearCookie("clinicToken");
    res.redirect("/");
});

module.exports = router;

const express = require('express');
const router = express.Router();
const clinicModel = require("../models/clinic");
// Clinic public routes
router.get("/:id", async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ _id: req.params.id });
        res.render("clinic", { clinic });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get("/:clinicid/aboutus", async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ _id: req.params.clinicid });
        res.render("clinic-aboutus", { clinic });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get("/:clinicid/news", async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ _id: req.params.clinicid });
        res.render("news", { clinic });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get("/:clinicid/contactus", async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ _id: req.params.clinicid });
        res.render("clinic-contactus", { clinic });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get("/:clinicid/beforeafter", async (req, res) => {
    try {
        const clinic = await clinicModel.findOne({ _id: req.params.clinicid });
        res.render("before-after", { clinic });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get("/clinicid/clinicContact", (req, res) => {
    res.render("clinic-contact");
});



module.exports = router;

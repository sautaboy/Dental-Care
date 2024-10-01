const express = require('express');
const router = express.Router();

// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');

const clinicModel = require("../models/clinic")
const patientModel = require("../models/patient")




router.get("/:id", async (req, res) => {
    let clinic = await clinicModel.findOne({ _id: req.params.id })
    res.render("clinic", { clinic })
})




router.post("/appointment/:clinicId", async (req, res) => {
    try {
        let clinicId = req.params.clinicId;
        let clinic = await clinicModel.findOne({ _id: clinicId });
        if (!clinic) {
            return res.status(404).send("Clinic not found");
        }

        let { name, phone, city, careFor } = req.body;

        await patientModel.create({
            name, phone, city, careFor
        });

        await clinic.save();
        res.redirect(req.get('Referer') || '/default-page');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});







module.exports = router;

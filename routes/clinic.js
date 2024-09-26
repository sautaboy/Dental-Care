const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const clinicModel = require("../models/clinic")
const patientModel = require("../models/patient")
const nodemailer = require('nodemailer');



router.get('/admin/addclinic', (req, res) => {
    res.render('addclinic');
});

// Show clinic page
router.get('/:clinicId', async (req, res) => {
    let clinic = await clinicModel.findOne({ _id: req.params.clinicId })
    res.render("clinic", { clinic })
});




// POST route to add a clinic
router.post('/admin/addclinic', async (req, res) => {
    try {
        const { clinicName, ownerEmail, ownerPhoneNumber } = req.body;
        // Create a new clinic entry
        const newClinic = await clinicModel.create({
            clinicName,
            ownerEmail,
            ownerPhoneNumber
        });
        // Respond with the created clinic
        res.status(200).json(newClinic);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding clinic');
    }
});



// Function to send email
const sendEmail = async (mailOptions) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    return transporter.sendMail(mailOptions);
};

// POST route for form submission
router.post('/submit/:clinicId', async (req, res) => {
    const { name, phone, city, careFor } = req.body;
    try {
        // Find the clinic by ID
        const clinic = await clinicModel.findOne({ _id: req.params.clinicId });
        if (!clinic) return res.status(404).send('Clinic not found');

        // Create patient record and add it to the clinic's patients array
        let patient = await patientModel.create({
            name,
            phone,
            city,
            careFor
        });
        clinic.patients.push(patient);
        await clinic.save();

        // Prepare mail options
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: clinic.ownerEmail,
            subject: 'New Appointment Request',
            text: `
                New appointment request received:

                Name: ${name}
                Phone: ${phone}
                City: ${city}
                Care For: ${careFor}
            `
        };

        // Send email asynchronously without waiting for it
        sendEmail(mailOptions).catch(error => console.error("Email sending failed:", error));

        // Redirect back to the clinic page with a success message
        res.redirect(req.get('Referer') || '/default-page');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your request');
    }
});
module.exports = router;

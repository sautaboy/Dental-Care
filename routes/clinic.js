const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const clinicModel = require("../models/clinic")
const { patientModel, validatePatient } = require("../models/patient")

const nodemailer = require('nodemailer');



router.get('/admin/addclinic', (req, res) => {
    res.render('addclinic');
});

// Show clinic page
router.get('/:clinicId', async (req, res) => {
    let clinic = await clinicModel.findOne({ _id: req.params.clinicId })

    res.render("clinic", { clinic, error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg') })
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
    const TWO_HOURS = 2 * 60 * 60 * 1000; // Two hours in milliseconds
    const { name, phone, city, careFor } = req.body;
    try {
        // Find the clinic by ID
        const clinic = await clinicModel.findOne({ _id: req.params.clinicId });
        if (!clinic) return res.status(404).send('Clinic not found');

        // Check if the same user has submitted a form in the past 2 hours
        const recentPatient = await patientModel.findOne({
            clinic: clinic._id, // Check submissions for the specific clinic
            submittedAt: { $gt: new Date(Date.now() - TWO_HOURS) } // Look for submissions within the last 2 hours
        });

        if (recentPatient) {
            req.flash('error_msg', 'You have already submitted a form recently. Please wait 2 hours before submitting again.');
            return res.redirect(req.get('Referer') || '/default-page');
        }

        // Validate user input
        const error = validatePatient({ name, phone, city, });

        if (error) {
            return req.flash('error_msg', 'Validation failed');
        }


        // Create a new patient record
        const patient = await patientModel.create({
            name,
            phone,
            city,
            careFor,
            submittedAt: new Date() // Store current submission time
        });


        clinic.patients.push(patient);
        await clinic.save();
        patient.clinic.push(clinic);
        await patient.save();

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

        // Success flash message
        req.flash('success_msg', 'Appointment request submitted successfully!');
        res.redirect(req.get('Referer') || '/default-page');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your request');
    }
});


module.exports = router;

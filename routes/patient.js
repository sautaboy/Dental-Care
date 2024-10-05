const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Import Nodemailer

const clinicModel = require("../models/clinic");
const patientModel = require("../models/patient");

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail user from .env
        pass: process.env.GMAIL_APP_PASSWORD // Your Gmail app password from .env
    }
});


router.post("/clinic/submitted-form/:clinicId", async (req, res) => {
    try {
        const { name, phone, city, message } = req.body;
        const clinicId = req.params.clinicId;
        const userIp = req.ip; // Capture the user's IP address

        // Check for previous submissions from the same IP
        const patient = await patientModel.findOne({
            ipAddress: userIp,
            "clinics.clinicId": clinicId,
        });

        const now = new Date();
        const twoHours = 2 * 60 * 60 * 1000; // Two hours in milliseconds

        // Check if the patient has already submitted within the last 2 hours
        if (patient && now - patient.clinics[0].lastSubmissionTime < twoHours) {
            const timeLeft = Math.ceil((twoHours - (now - patient.clinics[0].lastSubmissionTime)) / 1000 / 60);
            req.flash('error_msg', `You must wait ${timeLeft} more minutes before submitting to this clinic again.`);
            return res.redirect(req.get('Referer') || '/default-page');
        }

        // Allow submission and update submission time or create new record
        if (patient) {
            // Update existing patient's submission time
            patient.clinics[0].lastSubmissionTime = now;
            await patient.save(); // Save the updated patient
        } else {
            // Create a new patient record
            const newPatient = new patientModel({
                name,
                phone,
                city,
                message,
                ipAddress: userIp,
                clinics: [{ clinicId, lastSubmissionTime: now }],
            });
            await newPatient.save();

            // Push the new patient to the clinic's Patients array
            const clinic = await clinicModel.findById(clinicId);
            if (clinic) {
                clinic.patients.push(newPatient._id); // Add the new patient ID to the Patients array
                await clinic.save(); // Save the updated clinic
            }

            // Send email notification to the clinic
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: clinic.email, // Ensure this is a valid email
                subject: 'New Patient Submission',
                text: `You have a new patient submission:\n\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nMessage: ${message}`,
            };

            // Send the email
            if (clinic.email) {
                await transporter.sendMail(mailOptions);
            } else {
                console.error('No valid email found for the clinic.');
            }
        }

        req.flash('success_msg', 'Form submitted successfully!');
        res.redirect(req.get('Referer') || '/default-page');
    } catch (error) {
        req.flash('error_msg', 'An error occurred while submitting the form. Please try again.');
        console.error('Error during form submission:', error); // Log the error for debugging
        res.redirect(req.get('Referer') || '/default-page');
    }
});

module.exports = router;

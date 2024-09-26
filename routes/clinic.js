const express = require('express');
const Appointment = require('../models/appointment');
const router = express.Router();

// Show clinic page
router.get('/:clinicName', (req, res) => {
    res.render('clinic', { clinicName: req.params.clinicName });
});

// Handle appointment form submission
router.post('/:clinicName', async (req, res) => {
    const { patientName, email, phone, date, message } = req.body;

    const appointment = new Appointment({
        clinicName: req.params.clinicName,
        patientName,
        email,
        phone,
        date,
        message
    });

    try {
        await appointment.save();
        res.redirect(`/clinic/${req.params.clinicName}`);
    } catch (err) {
        res.status(400).send('Error saving appointment');
    }
});

module.exports = router;

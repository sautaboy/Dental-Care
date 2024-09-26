const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    clinicName: { type: String, required: true },
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    message: { type: String }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

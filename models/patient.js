const mongoose = require('mongoose');

// Patient schema
const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Ensure the patient's name is provided
    },
    phone: {
        type: String,
        required: true // Ensure the patient's phone number is provided
    },
    city: {
        type: String,
        required: true // Ensure the city is provided
    },
    careFor: {
        type: String,
        required: true // Ensure the care type is provided
    }
});

module.exports = mongoose.model('Patient', patientSchema);

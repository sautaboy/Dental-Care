const mongoose = require('mongoose');
const { Number } = require('twilio/lib/twiml/VoiceResponse');

// Clinic schema
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true // Ensure the clinic name is provided
    },
    ownerEmail: {
        type: String,
        required: true // Ensure the owner's email is provided
    },
    ownerPhoneNumber: {
        type: Number,
        required: true // Ensure the owner's email is provided
    },
    patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient" // Reference to the Patient model
    }]
});

module.exports = mongoose.model('Clinic', clinicSchema);

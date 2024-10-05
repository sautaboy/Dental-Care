const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    message: {
        type: String,
    },
    publicKeyCredential: {
        type: Object, // Store public key credential
    },
    clinics: [{
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic',
        },
        lastSubmissionTime: Date,
    }],
    ipAddress: String
});

module.exports = mongoose.model('Patient', patientSchema);

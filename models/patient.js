const mongoose = require('mongoose');
const Joi = require('joi');
// Patient schema
const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    careFor: {
        type: String,
        required: true
    },
    submittedAt: { type: Date, default: Date.now },
    clinic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }]
});

let patientModel = mongoose.model('Patient', patientSchema);
module.exports = { patientModel }

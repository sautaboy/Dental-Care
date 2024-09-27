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


const validatePatient = (data) => {
    // Joi validation schema
    const patientValidationSchema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        phone: Joi.string().pattern(/^[0-9]+$/).length(10).required(),
        city: Joi.string().alphanum().min(2).max(100).required(),
        submittedAt: Joi.date().default(new Date())
    });


    const { error } = patientValidationSchema.validate(data);

    if (error) return error;

}

let patientModel = mongoose.model('Patient', patientSchema);
module.exports = { patientModel, validatePatient }

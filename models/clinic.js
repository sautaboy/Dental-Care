const mongoose = require('mongoose');

// Clinic schema
const clinicSchema = new mongoose.Schema({
    clinicName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    teamMembers: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        description: { type: String },
        image: { type: String } // URL or path to the uploaded image
    }],
    aboutUs: [{
        image: { type: String }, // URL or path to the overall 'About Us' section image
        paragraphs: [{
            paragraph: { type: String }
        }]
    }],
    services: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true }, // Category of the service
        image: { type: String } // URL or path to the uploaded image
    }],
    crausel: [{
        image: { type: String }
    }],
    patients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    }]
});

module.exports = mongoose.model('Clinic', clinicSchema);

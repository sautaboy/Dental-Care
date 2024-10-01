const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phoneNumber: String,

}, { timestamps: true })

module.exports = mongoose.model("Developer", developerSchema)
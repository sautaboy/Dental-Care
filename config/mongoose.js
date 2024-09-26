const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost/dental-care');
const db = mongoose.connection


db.on('error', function (err) {
    console.log(err);
})
db.on("open", function () {
    console.log("Connected to MongoDB");
})

module.exports = db

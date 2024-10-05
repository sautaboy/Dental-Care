const express = require('express');
const app = express();
const path = require('path');

const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const clinicRoutes = require('./routes/clinic');
const adminRoutes = require("./routes/admin");
const patientRoutes = require("./routes/patient");
const db = require("./config/mongoose");
const clinicModel = require('./models/clinic');
const isOwnerLoggedIn = require("./config/isOwnerLoggedIn")

// Middleware to parse cookies before checking the login status
app.use(cookieParser()); // Move this before isOwnerLoggedIn
app.use(session({
    secret: 'your_secret_key', // replace with your own secret
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});



// Middleware for static files and URL encoding
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/clinic', clinicRoutes);
app.use('/admin', adminRoutes);
app.use('/patient', patientRoutes);


app.get('/', isOwnerLoggedIn, async (req, res) => {
    let clinics = await clinicModel.find();
    res.render('index', { clinics, isOwnerLoggedIn: req.isOwnerLoggedIn });
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});

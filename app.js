const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();
const mongoose = require('mongoose');
const clinicRoutes = require('./routes/clinic');
const db = require("./config/mongoose")
const clinicModel = require('./models/clinic');

const app = express();



// Middleware
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'));

app.use(session({
    secret: 'your_secret_key', // replace with your own secret
    resave: false,
    saveUninitialized: true
}));

app.use(flash());


// Routes
app.use('/clinic', clinicRoutes);


app.get('/', async (req, res) => {
    let clinics = await clinicModel.find()
    res.render('index', { clinics });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

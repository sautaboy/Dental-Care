const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const clinicRoutes = require('./routes/clinic');
const db = require("./config/mongoose")
const clinicModel = require('./models/clinic');
const clinic = require('./models/clinic');



const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.static('public'));

// Routes
app.use('/clinic', clinicRoutes);


app.get('/', async (req, res) => {
    let clinics = await clinicModel.find()
    res.render('index', { clinics });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

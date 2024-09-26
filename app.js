const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const clinicRoutes = require('./routes/clinic');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost/dental-care');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.use('/clinic', clinicRoutes);


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

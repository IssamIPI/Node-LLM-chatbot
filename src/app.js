// src/app.js
const express = require('express');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api', apiRoutes);

module.exports = app;

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

router.get('/asesores/index', (req, res) =>{
    res.render('asesores/index');
});

module.exports = router;
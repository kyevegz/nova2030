const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

router.get('/queEs', (req, res) => {
    res.render('queEs');
});

module.exports = router;
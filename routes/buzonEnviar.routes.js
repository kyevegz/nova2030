const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

router.get('/buzon-enviar', (req, res) => {
    res.render('buzon-enviar');
});

module.exports = router;
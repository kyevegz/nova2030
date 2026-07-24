const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

router.get('/index', (req, res) => {
    res.render('index');
});

module.exports = router;
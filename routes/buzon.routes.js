const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const rutasValidas = ['enviar', 'faq'];

router.get('/buzon/:option', (req, res) => {
    const {option} = req.params;

    if(!rutasValidas.includes(option)){
        return res.status(404).render('404');
    }

    res.render(`buzon/${option}`);
});

module.exports = router;
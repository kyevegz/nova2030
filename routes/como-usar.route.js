const express = require('express');
const router = express.Router();
const db = require('../config/db');const jwt = require('jsonwebtoken');
//const verificarToken = require('../middlewares/auth');

router.get('/comoUsar', (req, res) => {


    res.render('comoUsar');
});
module.exports = router;
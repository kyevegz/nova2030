const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middlewares/auth');


router.get('/perfil', verificarToken,  (req, res) => {


    res.render('perfil/index');
});
module.exports = router;
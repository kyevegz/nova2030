const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../middlewares/auth');

//ruta para la fase 1 protegida
router.get('/fase/1', verificarToken, async (req, res) => {
    try{
        const [submodulos] = await db.query('SELECT * FROM modulos WHERE fase = ?', [1]);
        res.render('fase1', { submodulos });

    }catch (error){
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
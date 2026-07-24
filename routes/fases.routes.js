const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../middlewares/auth');

//ruta para la fase 1 protegida
router.get('/fase/1', verificarToken, async (req, res) => {
    try{
        //obtener el id del usuario directamente del token con ayuda del middleware
        //nos aseguramos de que los nombres coincidan (esto con lo guardado en el token)
        const idUsuario = req.usuario.id;

        /*en el select se hace un JOIN para que, trayendo toda la info de 
        los módulos, se pegue el estado de el campo desbloqueado y completado 
        de el usuario actual*/
        const [submodulos] = await db.query(`
            SELECT modul.*, progu.desbloqueado, progu.completado
            FROM modulos modul
            JOIN progreso_usuarios progu ON modul.id = progu.idModulo
            WHERE modul.fase = ? AND progu.idUsuario = ?
            ORDER BY modul.id ASC
        `, [1, idUsuario]);

        res.render('fase1', { submodulos });

    }catch (error){
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
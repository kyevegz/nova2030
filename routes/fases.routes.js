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

        res.render('fase1', { submodulos, mostrarProgreso: true, esModulo: false });

    }catch (error){
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
});


//:idModulo es para dinamismo en la URL
router.get('/fase/1/modulo/:idModulo', verificarToken, async (req, res) => {
    try{
        const idUsuario = req.usuario.id;        
        const idModulo = req.params.idModulo; 
        
        //1 - consulta a la información del modulo actual, para obtener el contenido y su información en general
        const [moduloActual] = await db.query(`
            SELECT * FROM modulos WHERE id = ?
            `, [idModulo]);
        
        //2 - aquí entrarán las consultas del contenido del modulo

        //rederización de la vista del modulo, donde se puede cambiar fase1 por otra plantilla
        res.render('contenido-modulo', {
            moduloActual: moduloActual[0],
            mostrarProgreso: true,
            esModulo: true //activará el botón de regresar y cambiará los elementos de la barra
        });
        
    }catch(error){
        console.error(error);
        res.status(500).send("Error en el servidor");
    }
})

module.exports = router;
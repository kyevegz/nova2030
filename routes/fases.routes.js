const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../middlewares/auth');
const {progresoPorFaseUsr} = require('../utils/progresoUtils.js');

/*informacion fija de las fases de nova, se hace un diccionario 
para no crear una tabla en la bd y aumentar las consultas 
desde express*/
const dicFases = {
    1: {
        titulo: "Fase 1",
        descripcion: "Inicia tu viaje de transformación. En esta fase explorarás tus habilidades, los retos globales, la agenda 2030 y generarás ideas antes de avanzar a la fase 2."
    },
    2: {
        titulo: "Fase 2",
        descripcion: "Lorem"
    },
    3: {
        titulo: "Fase 3",
        descripcion: "Lorem"
    }
};
//ruta para cualquier fase, verificando si hay sesión activa
router.get('/fase/:numFase', verificarToken, async (req, res) => {
    try {
        
        const fasePedida = parseInt(req.params.numFase);
        //obtener el id del usuario directamente del token con ayuda del middleware
        //nos aseguramos de que los nombres coincidan (esto con lo guardado en el token)
        const idUsuario = req.usuario.id;
        const { numFase } = req.params;
        const [rows] =await db.query(`
            SELECT faseActual FROM usuarios WHERE id = ?
        `, [idUsuario]);

        //validar que el usuario existe en la bd porque peor si lo elominé por violar las reglas
        if(rows.length === 0) {
            return res.redirect('/login');
        }

        const usuarioFase = rows[0];
        
        if(fasePedida > usuarioFase.faseActual){
            return res.redirect(`/fase/${usuarioFase.faseActual}`);
        }

        const datosFase = dicFases[fasePedida];

        //por seguridad validad que la fase solicita exista
        if (!['1', '2', '3'].includes(numFase)) {
            return res.redirect('/index');
        }


        /*en el select se hace un JOIN para que, trayendo toda la info de 
        los módulos, se pegue el estado de el campo desbloqueado y completado 
        de el usuario actual*/
        const [submodulos] = await db.query(`
            SELECT modul.*, progu.desbloqueado, progu.completado
            FROM modulos modul
            JOIN progreso_usuarios progu ON modul.id = progu.idModulo
            WHERE modul.fase = ? AND progu.idUsuario = ?
            ORDER BY modul.id ASC
        `, [numFase, idUsuario]);


        //const modulosCompletados = 1, totalModulos = 5;
        
        const porcentajeActual = await progresoPorFaseUsr(idUsuario, numFase);
        console.log(porcentajeActual)
        //usa unna sola vista para las 3 fases
        res.render('fase', {
            numFase, //cambia el título dinámicamente
            porcentaje: porcentajeActual,
            submodulos,
            mostrarProgreso: true,
            esModulo: false,
            usuarioVerificado: req.usuario, // Inyección directa
            datosFase
        });

    } catch (error) {
        console.error('Error al cargar la fase:', error);
        res.status(500).send("Error en el servidor");
    }
});

//ruta para cualquier modulo
//:idModulo es para dinamismo en la URL
router.get('/fase/:numFase/modulos/modulo-:idModulo', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const { numFase, idModulo } = req.params;

        /*1 -
        control de seguridad: verifica que el usuario actual tenga 
        desbloqueado el módulo que intenta consultar
        */


        const [desbloqueado] = await db.query(`
            SELECT desbloqueado 
            FROM progreso_usuarios 
            WHERE idUsuario = ? AND idModulo = ?
        `, [idUsuario, idModulo]);

        //dheca si el usuario no tiene registro o la casilla de desbloqueado en false, regresa a la vista de fase x


        if (desbloqueado.length === 0 || desbloqueado[0].desbloqueado === 0) return res.redirect(`/fase/${numFase}`);

        //2 - consulta a la información del modulo actual, para obtener el contenido y su información en general
        const [moduloActual] = await db.query(`
            SELECT * FROM modulos WHERE id = ?
            `, [idModulo]);

        if (moduloActual.length === 0) return res.redirect(`fase${numFase}`);

        //2 - renderización de moldes diferentes
        /*Dado que cada módulo tiene contenido diferente, se buscará dinámicamente el
        archivo correspondiente, basado en la nomenclatura modulo-x, donde x es
        el número de modulo que intenta consultar */
        const porcentajeActual = await progresoPorFaseUsr(idUsuario, numFase);

        res.render(`modulos/modulo-${idModulo}`, {
            moduloActual: moduloActual[0],
            numFase,
            porcentaje: porcentajeActual,
            mostrarProgreso: true,
            esModulo: true, //activará el botón de regresar y cambiará los elementos de la barra
            usuarioVerificado: req.usuario // Inyección directa
        });

    } catch (error) {
        console.error('error en la carga del módulo', error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
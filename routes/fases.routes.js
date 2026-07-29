const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../middlewares/auth');
const { progresoPorFaseUsr } = require('../utils/progresoUtils.js');

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

//diccionario de datos e informacipon para la flip card de los ods
const odsData = [
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
    {
        id: 1,
        title: '',
        color: '#',
        image: 'S-WEB-Goal-01' ,
        description: ''
    },
];
//ruta para cualquier fase, verificando si hay sesión activa
router.get('/fase/:numFase', async (req, res) => {
    try {

        const fasePedida = parseInt(req.params.numFase);
        const { numFase } = req.params;


        //por seguridad validad que la fase solicita exista
        if (!['1', '2', '3'].includes(numFase)) {
            return res.redirect('/index');
        }

        const datosFase = dicFases[fasePedida];

        /* 
            BLOQUE DE CONTENIDO
            2. extraer el usuario del middleware global en index.js
            cuando no hay usuario, o sea, sesión, lo deja como null
        */

        const usuario = res.locals.usuarioVerificado;

        /*Declaraciones de variables para respetar dry, 
        dejando incializados valores por defecto*/

        let porcentajeActual = 0, submodulos = [],
            mostrarProgreso = false, estadoBloqueado = false, 
            modificadorContent = '';

        //CASO 1: usuario SIN cuenta

        if (!usuario) {
            /*consulta la información de los módulos mas no hace join 
            porque ese usuario no está en la bd*/
            const [rows] = await db.query(`
                SELECT * FROM modulos WHERE fase = ? ORDER BY id ASC
            `, [numFase]);

            submodulos = rows;
            estadoBloqueado = 'sinCuenta';//activa el candado
            //mostrarProgreso conserva su valor por default
            modificadorContent = 'content--locked';

        } else {
            //CASOS 2 Y 3: USUARIOS CON CUENTA
            const idUsuario = usuario.id;
            const [rows] = await db.query(`
                SELECT faseActual FROM usuarios WHERE id = ?
            `, [idUsuario]);

            //validar que el usuario existe en la bd porque peor si lo elominé por violar las reglas
            if (rows.length === 0) {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                //detiene la ejecución y adiós
                return res.redirect('/login');
            }

            const usuarioFase = rows[0];

            /*en el select se hace un JOIN para que, trayendo toda la info de 
            los módulos, se pegue el estado de el campo desbloqueado y completado 
            de el usuario actual*/
            const [modulosUsuario] = await db.query(`
                SELECT modul.*, progu.desbloqueado, progu.completado
                FROM modulos modul
                JOIN progreso_usuarios progu ON modul.id = progu.idModulo
                WHERE modul.fase = ? AND progu.idUsuario = ?
                ORDER BY modul.id ASC
            `, [numFase, idUsuario]);

            submodulos = modulosUsuario;
            porcentajeActual = await progresoPorFaseUsr(idUsuario, numFase);
            mostrarProgreso = true;

            if (fasePedida > usuarioFase.faseActual) {
                estadoBloqueado = 'faseBloqueada';
                modificadorContent = 'content--preview';
            }
        }

        //usa unna sola vista para las 3 fases
        res.render('fase', {
            numFase, //cambia el título dinámicamente
            porcentaje: porcentajeActual,
            submodulos,
            mostrarProgreso,
            esModulo: false,
            usuarioVerificado: usuario, // Inyección directa
            datosFase,
            estadoBloqueado,
            modificadorContent
        });

    } catch (error) {
        console.error('Error al cargar la fase:', error);
        res.status(500).send("Error en el servidor");
    }
});

//ruta para cualquier modulo
//:idModulo es para dinamismo en la URL
router.get('/fase/:numFase/modulos/modulo-:idModulo', async (req, res) => {
    try {

        const usuario = res.locals.usuarioVerificado;
        const { numFase, idModulo } = req.params;

        //Declaración de variables
        let porcentajeActual = 0, estadoBloqueado = false, modificadorContent = '';
        const [moduloActual] = await db.query(`
            SELECT * FROM modulos WHERE id = ?
            `, [idModulo]);

        //Si el modulo no existe, redirige
        if (moduloActual.length === 0) return res.redirect(`fase${numFase}`);


        /*
        CONDCIONAL DE ACCESO
        */

        if (!usuario) {
            //CASO 1 - usuario SIN cuenta
            estadoBloqueado = 'sinCuenta';
            modificadorContent = 'content--locked';
        } else {
            //CASOS 2 Y 3
            const idUsuario = usuario.id;
            porcentajeActual = await progresoPorFaseUsr(idUsuario, numFase);
            const [progreso] = await db.query(`
                SELECT desbloqueado 
                FROM progreso_usuarios 
                WHERE idUsuario = ? AND idModulo = ?
            `, [idUsuario, idModulo]);
            if (progreso.length === 0 || progreso[0].desbloqueado === 0) {estadoBloqueado = 'moduloBloqueado', modificadorContent = 'content--preview'};
        }

        //2 - renderización de moldes diferentes
        /*Dado que cada módulo tiene contenido diferente, se buscará dinámicamente el
        archivo correspondiente, basado en la nomenclatura modulo-x, donde x es
        el número de modulo que intenta consultar */
        console.log(estadoBloqueado);

        res.render(`modulos/modulo-${idModulo}`, {
            moduloActual: moduloActual[0],
            numFase,
            porcentaje: porcentajeActual,
            mostrarProgreso: true,
            esModulo: true, //activará el botón de regresar y cambiará los elementos de la barra
            usuarioVerificado: usuario, // Inyección directa
            estadoBloqueado,
            modificadorContent
        });

    } catch (error) {
        console.error('error en la carga del módulo', error);
        res.status(500).send("Error en el servidor");
    }
});

module.exports = router;
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
const ods = [
    {
        id: 1,
        title: 'Fin de la pobreza',
        color: '#E5243B',
        
        description: 'Poner fin a la pobreza en todas sus formas y en todo el mundo'
    },
    {
        id: 2,
        title: 'Hambre cero',
        color: '#DDA63A',
        
        description: 'Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la nutrición y promover la agricultura sostenible'
    },
    {
        id: 3,
        title: 'Salud y bienestar',
        color: '#4C9F38',
        
        description: 'Garantizar una vida sana y promover el bienestar de todos a todas las edades'
    },
    {
        id: 4,
        title: 'Educación de calidad',
        color: '#C5192D',
        
        description: 'Garantizar una educación inclusiva y equitativa de calidad y promover oportunidades de aprendizaje permanente para todos'
    },
    {
        id: 5,
        title: 'Igualdad de género',
        color: '#FF3A21',
        
        description: 'Lograr la igualdad de género y empoderar a todas las mujeres y las niñas'
    },
    {
        id: 6,
        title: 'Agua limpia y saneamiento',
        color: '#26BDE2',
        
        description: 'Garantizar la disponibilidad y la gestión sostenible del agua y el saneamiento para todos'
    },
    {
        id: 7,
        title: 'Energía asequible y no contaminante',
        color: '#FCC30B',
        
        description: 'Garantizar el acceso a una energía asequible, fiable, sostenible y moderna para todos'
    },
    {
        id: 8,
        title: 'Trabajo decente y crecimiento económico',
        color: '#A21942',
        
        description: 'Promover el crecimiento económico sostenido, inclusivo y sostenible, el empleo pleno y productivo y el trabajo decente para todos'
    },
    {
        id: 9,
        title: 'Industria, innovación e infraestructuras',
        color: '#FD6925',
        
        description: 'Construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación'
    },
    {
        id: 10,
        title: 'Reducción de las desigualdades',
        color: '#DD1367',
        
        description: 'Reducir la desigualdad en los países y entre ellos'
    },
    {
        id: 11,
        title: 'Ciudades y comunidades sostenibles',
        color: '#FD9D24',
        
        description: 'Lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles'
    },
    {
        id: 12,
        title: 'Producción y consumo responsables',
        color: '#BF8B2E',
        
        description: 'Garantizar modalidades de consumo y producción sostenibles'
    },
    {
        id: 13,
        title: 'Acción por el clima',
        color: '#3F7E44',
        
        description: 'Adoptar medidas urgentes para combatir el cambio climático y sus efectos'
    },
    {
        id: 14,
        title: 'Vida submarina',
        color: '#0A97D9',
        
        description: 'Conservar y utilizar sosteniblemente los océanos, los mares y los recursos marinos para el desarrollo sostenible'
    },
    {
        id: 15,
        title: 'Vida de ecosistemas terrestres',
        color: '#56C02B',
        
        description: 'Proteger, restablecer y promover el uso sostenible de los ecosistemas terrestres, gestionar sosteniblemente los bosques, luchar contra la desertificación, detener e invertir la degradación de las tierras y detener la pérdida de biodiversidad'
    },
    {
        id: 16,
        title: 'Paz, justicia e instituciones sólidas',
        color: '#00689D',
        
        description: 'Promover sociedades pacíficas e inclusivas para el desarrollo sostenible, facilitar el acceso a la justicia para todos y construir a todos los niveles instituciones eficaces e inclusivas que rindan cuentas'
    },
    {
        id: 17,
        title: 'Alianzas para lograr los objetivos',
        color: '#19486A',
        
        description: 'Fortalecer los medios de implementación y revitalizar la Alianza Mundial para el Desarrollo Sostenible'
    }
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
        

        res.render(`modulos/modulo-${idModulo}`, {
            moduloActual: moduloActual[0],
            numFase,
            porcentaje: porcentajeActual,
            mostrarProgreso: true,
            esModulo: true, //activará el botón de regresar y cambiará los elementos de la barra
            usuarioVerificado: usuario, // Inyección directa
            estadoBloqueado,
            modificadorContent,
            ods
        });

    } catch (error) {
        console.error('error en la carga del módulo', error);
        res.status(500).send("Error en el servidor");
    }
});

router.get('/fase/:numFase/modulos/modulo-:idModulo/ods/:odsId', async (req, res) => {
    try{
        const usuario = res.locals.usuarioVerificado;
        const {numFase, idModulo, odsId} = req.params;

        //valida que el ods exista en el diccionario, es decir, que esté entre 1-17
        const informacionOds = odsData[id];

        if(!informacionOds) return res.redirect(`/fase/${numFase}/modulos/modulo-${idModulo}`);

        let estadoBloqueado = false, modificadorContent = '';
        //condicional para el acceso
        if(!usuario){
            estadoBloqueado = 'sinCuenta';
            modificadorContent = 'content--locked';
        }else{
            const idUsuario = usuario.id;
            const [progreso] = await db.query(`
                SELECT desbloqueado
                FROM progreso_usuarios
                WHERE idUsuario = ? AND idModulo = ?
            `, [idUsuario, idModulo]);

            if(progreso.length === 0 || progreso[0].desbloqueado === 0){
                estadoBloqueado = 'moduloBloqueado';
                modificadorContent = "content--preview";
            }
        }

        //renderizar la plantulla única de ods
        res.render('ods', {
            numFase,
            idModulo,
            ods: informacionOds,
            flipcard: 
            estadoBloqueado,
            modificadorContent
        });
    }catch(error){
        console.error('Error al cargar el ODS: ', error);
        res.status(500).send('Error en el servidor');
    }
    


})
//ruta para modulo-2, los ods

module.exports = router;
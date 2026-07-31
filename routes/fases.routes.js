const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verificarToken = require('../middlewares/auth');
const { progresoPorFaseUsr } = require('../utils/progresoUtils.js');
const odsInfo = require('../data/odsData.js');
/*informacion fija de las fases de nova, se hace un diccionario 
para no crear una tabla en la bd y aumentar las consultas 
desde express*/
const dicFases = {
    1: {
        titulo: "Fase 1",
        objetivo: "Brindar a los usuarios los conocimientos necesarios para comprender los principales retos del mundo, identificar sus intereses y habilidades, y orientarlos hacia el desarrollo de un proyecto que impacte socialmente en diferentes areas, y del mismo modo, estar alineado con los Objetivos de Desarrollo Sostenible (ODS)."
    },
    2: {
        titulo: "Fase 2",
        objetivo: "Objetivo"
    },
    3: {
        titulo: "Fase 3",
        objetivo: "Objetivo"
    }
};

//diccionario de datos e informacipon para la flip card de los ods
const odsTarjetas = [
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

const cuestionario = [
    {
        id: 1,
        pregunta: "Cuando surge un problema, normalmente tú...",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Tomas la iniciativa y propones una solución."},
            {valor: "B", texto: "Piensas en una idea diferente."},
            {valor: "C", texto: "Investigas por qué sucede el problema."},
            {valor: "D", texto: "Escuchas a todos antes de tomar una decisión."}
        ]
    },
    {
        id: 2,
        pregunta: "En un trabajo en equipo normalmente tú…",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Organizas al equipo."},
            {valor: "B", texto: "Diseñas las ideas."},
            {valor: "C", texto: "Buscas información."},
            {valor: "D", texto: "Ayudas a que todos participen."}
        ]
    },
    {
        id: 3,
        pregunta: "¿Qué actividad disfrutas más?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Dirigir proyectos"},
            {valor: "B", texto: "Crear o diseñar"},
            {valor: "C", texto: "Investigar."},
            {valor: "D", texto: "Ayudar a otras personas"}
        ]
    },
    {
        id: 4,
        pregunta: "Cuando tienes una nueva idea",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Empiezas a desarrollarla."},
            {valor: "B", texto: "Haces un boceto o prototipo"},
            {valor: "C", texto: "Investigas si ya existe."},
            {valor: "D", texto: "La compartes con otras personas"}
        ]
    },
    {
        id: 5,
        pregunta: "¿Qué materia te gusta más?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Matemáticas."},
            {valor: "B", texto: "Ciencias."},
            {valor: "C", texto: "Arte"},
            {valor: "D", texto: "Formación Cívica o Ciencias Sociales."}
        ]
    },
    {
        id: 6,
        pregunta: "Si pudieras resolver un problema, elegirías…",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "La contaminación."},
            {valor: "B", texto: "La pobreza."},
            {valor: "C", texto: "La falta de educación."},
            {valor: "D", texto: "La falta de innovación tecnológica."}
        ]
    },
    {
        id:7 ,
        pregunta: "",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Construir un prototipo."},
            {valor: "B", texto: "Programar."},
            {valor: "C", texto: "Investigar."},
            {valor: "D", texto: "Organizar campañas sociales."}
        ]
    },
    {
        id: 8,
        pregunta: " ¿Qué disfrutas más?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Crear."},
            {valor: "B", texto: "Descubrir."},
            {valor: "C", texto: "Enseñar."},
            {valor: "D", texto: "Emprender."}
        ]
    },
    {
        id: 9,
        pregunta: "Si participaras en una feria de ciencias, ¿qué proyecto elegirías?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Un robot."},
            {valor: "B", texto: "Una investigación."},
            {valor: "C", texto: "Una campaña social."},
            {valor: "D", texto: "Un producto ecológico."}
        ]
    },
    {
        id: 10,
        pregunta: "Cuando alguien tiene un problema normalmente tú…",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Lo ayudas."},
            {valor: "B", texto: "Buscas una solución."},
            {valor: "C", texto: "Investigas qué lo ocasionó."},
            {valor: "D", texto: "Organizas personas para resolverlo."}
        ]
    },
    {
        id: 11,
        pregunta: "¿Qué habilidad consideras que tienes más desarrollada?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Liderazgo."},
            {valor: "B", texto: "Creatividad."},
            {valor: "C", texto: "Pensamiento lógico."},
            {valor: "D", texto: "Comunicación."}
        ]
    },
    {
        id: 12,
        pregunta: "¿Cómo prefieres aprender?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Haciendo proyectos."},
            {valor: "B", texto: "Investigando."},
            {valor: "C", texto: "Viendo ejemplos."},
            {valor: "D", texto: "Trabajando con otras personas."}
        ]
    },
    {
        id:13 ,
        pregunta: "¿Qué te emociona más?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Crear una empresa."},
            {valor: "B", texto: "Desarrollar nueva tecnología."},
            {valor: "C", texto: "Ayudar a una comunidad."},
            {valor: "D", texto:"Descubrir algo nuevo."}
        ]
    },
    {
        id: 14,
        pregunta: "¿Qué tipo de proyecto te gustaría desarrollar?",
        tipo: "radio",
        opciones: [
            {valor: "A", texto: "Tecnológico."},
            {valor: "B", texto: "Científico."},
            {valor: "C", texto: "Social."},
            {valor: "D", texto: "Ambiental."}
        ]
    },
    {
        id: 15,
        pregunta: "Selecciona tres Objetivos de Desarrollo Sostenible que más llamen tu atención.",
        tipo: "checkbox",
        limite: 3,
        opciones: [
            {valor: "ods1", texto: "1.Fin de la pobreza", imagen: "/images/content/ods/Goal-01.png"},
            {valor: "ods2", texto: "2.Fin de la pobreza", imagen: "/images/content/ods/Goal-02.png"},
            {valor: "ods3", texto: "3.Fin de la pobreza", imagen: "/images/content/ods/Goal-03.png"},
            {valor: "ods4", texto: "4.Fin de la pobreza", imagen: "/images/content/ods/Goal-04.png"},
            {valor: "ods5", texto: "5.Fin de la pobreza", imagen: "/images/content/ods/Goal-05.png"},
            {valor: "ods6", texto: "6.Fin de la pobreza", imagen: "/images/content/ods/Goal-06.png"},
            {valor: "ods7", texto: "7.Fin de la pobreza", imagen: "/images/content/ods/Goal-07.png"},
            {valor: "ods8", texto: "8.Fin de la pobreza", imagen: "/images/content/ods/Goal-08.png"},
            {valor: "ods9", texto: "9.Fin de la pobreza", imagen: "/images/content/ods/Goal-09.png"},
            {valor: "ods10", texto: "10.Fin de la pobreza", imagen: "/images/content/ods/Goal-10.png"},
            {valor: "ods11", texto: "11.Fin de la pobreza", imagen: "/images/content/ods/Goal-11.png"},
            {valor: "ods12", texto: "12.Fin de la pobreza", imagen: "/images/content/ods/Goal-12.png"},
            {valor: "ods13", texto: "13.Fin de la pobreza", imagen: "/images/content/ods/Goal-13.png"},
            {valor: "ods14", texto: "14.Fin de la pobreza", imagen: "/images/content/ods/Goal-14.png"},
            {valor: "ods15", texto: "15.Fin de la pobreza", imagen: "/images/content/ods/Goal-15.png"},
            {valor: "ods16", texto: "16.Fin de la pobreza", imagen: "/images/content/ods/Goal-16.png"},
            {valor: "ods17", texto: "17.Fin de la pobreza", imagen: "/images/content/ods/Goal-17.png"}
            
        ]
    },
]
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
        
        const opcionesRender ={
            moduloActual: moduloActual[0],
            numFase,
            porcentaje: porcentajeActual,
            mostrarProgreso: true,
            esModulo: true, //activará el botón de regresar y cambiará los elementos de la barra
            usuarioVerificado: usuario, // Inyección directa
            estadoBloqueado,
            modificadorContent,
            
        };

        //condicional de inyección, solo mandar info para flipcards, si es el modulo 2
        if(idModulo === '2'){
            opcionesRender.ods = odsTarjetas;
        }

        if(idModulo === '7'){
            opcionesRender.preguntas = cuestionario;
        }
        res.render(`modulos/modulo-${idModulo}`, opcionesRender);

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
        const informacionOds = odsInfo[odsId];
        

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
        res.render('modulos/ods/ods', {
            numFase,
            idModulo,
            odsIn: informacionOds,
            usuarioVerificado: usuario,
            estadoBloqueado,
            modificadorContent,
            
        });
    }catch(error){
        console.error('Error al cargar el ODS: ', error);
        res.status(500).send('Error en el servidor');
    }
    


})
//ruta para modulo-2, los ods

module.exports = router;
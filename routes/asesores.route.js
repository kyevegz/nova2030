const express = require('express');
const router = express.Router();
const db = require('../config/db');
// const jwt = require('jsonwebtoken');

const descripcionesAsesores = {
    1: {
        id: 'Ciencias Sociales',
        tipo: 'Nuestros asesores de Ciencias Sociales',
        descripcion: 'Profesionales que analizan los comportamientos, las necesidades y las dificultades de la sociedad, con el fin derecopilar información sobre el comportamiento humano. '
    },
    2: {
        id: 'Didáctico',
        tipo: 'Nuestros asesores de Didáctico',
        descripcion: 'El ámbito educativo es el pilar del desarrollo humano, por ello, los expertos en didáctica destinan su tiempo a planificar, implementar y evaluar programas educativos.'
    },
    3: {
        id: 'Emprendimiento',
        tipo: 'Nuestros asesores de Emprendimiento',
        descripcion: 'Las estrategias, el liderazgo y la gestión de recursos financieros son algunas de las cosas por las que destacan nuestros expertos en emprendimiento, profesionales que te ayudarán a desarrollar ese plan estrátegico para iniciar la trayectoria de tu negocio. '
    },
    4: {
        id: 'Medio Ambiente',
        tipo: 'Nuestros asesores de Medio Ambiente',
        descripcion: 'Si tu proyecto se enfoca en minimizar el impacto ecológico  y hacer buen uso de los recursos naturales, estos especialiastas te orientataran en este y otros sentidos.'
    },
    5: {
        id: 'Tecnología',
        tipo: 'Nuestros asesores de Tecnología',
        descripcion: 'En el amplío mundo de la tecnologías, diversos asesores cuentan con habilidades que brinda soporte técnico y soluciones profesionales a lo largo de diversos ejes, atentos a los nuevos estándares tecnológicos, haciendo valer sus niveles de experiencia y certificaciones.'
    },
    6: {
        id: 'todas',
        tipo: 'Nuestros asesores',
        descripcion: 'Para desarrollar tu proyecto, encuentra al experto ideal que aporte su experiencia y conocmientos para potencia tu idea.'
    }
}
router.get('/asesores', async (req, res) =>{
    try{
        //consultar todos los registros de cateforías
        const [categorias ] =await db.query('SELECT * FROM categorias');
        let asesores = [];
        const limit = 9;
        let paginaActual = parseInt(req.query.page) || 1;
        let totalPaginas = 0, offset = (paginaActual - 1) * limit;
        

        //si no trae el parámetro page, es entonces la número 1
        let descripcionAsesor = descripcionesAsesores[6];


        /*se lee la categorías que el usuario seleccionó en la url, 
        por ejemplo, ?categoria=emprendimiento
        Si no encuentra, se sobreentiende que quiere ver todos los asesores
        */

        //esta línea es la que extrae eso, el || asigna un valor por defecto cuando no 
        // se escribe un filtro ?filtro=valor en la url
        let categoriaSeleccionada = req.query.categoria || 'todas';
        const existeCategoria = categorias.some(cat => cat.nombreCat === categoriaSeleccionada);

        for(let i = 1; i <= 5; i++){
            if(descripcionesAsesores[i].id === categoriaSeleccionada){
                descripcionAsesor = descripcionesAsesores[i];
            }
        }
        //console.log(categoriaSeleccionada)

        if(!existeCategoria){
            categoriaSeleccionada = 'todas';
            
            const [[totalRegistros]] = await db.query(`
                SELECT COUNT(*) AS total FROM asesores
            `);
            totalPaginas = Math.ceil(totalRegistros.total/limit);

            
            [asesores] = await db.query(
                `SELECT nombre, apellidop, apellidom, gradoEscolar, 
                descripcion, inicioTurno, finTurno, cat.nombreCat 
                FROM asesores
                JOIN categorias cat ON asesores.idCategoria = cat.id
                LIMIT ? OFFSET ?
                `, [limit, offset]
            );
            
        }else{
            const [[totalRegistros]] = await db.query(`
                SELECT COUNT(*) AS total
                FROM asesores 
                JOIN categorias cat ON asesores.idCategoria = cat.id
                WHERE cat.nombreCat =?`, 
                [categoriaSeleccionada]);
            totalPaginas = Math.ceil(totalRegistros.total/limit);

            [asesores] = await db.query(
                `SELECT nombre, apellidop, apellidom, gradoEscolar, 
                descripcion, inicioTurno, finTurno, cat.nombreCat
                FROM asesores
                JOIN categorias cat ON asesores.idCategoria = cat.id
                WHERE cat.nombreCat = ?
                LIMIT ? OFFSET ?`
            ,[categoriaSeleccionada, limit, offset]);
        }

        

        console.log(categorias)
        //se envían los datos de la vista para que en ejs sean dibujados y plasmados en el navtabs
        res.render('asesores/index', {
            totalPaginas,
            categorias,
            paginaActual,
            categoriaSeleccionada, 
            descripcionAsesor,
            asesores
        });
    }catch(error){
        console.error("Error al cargar la página de asesores.", error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
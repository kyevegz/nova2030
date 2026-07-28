const express = require('express');
const router = express.Router();
const db = require('../config/db');
// const jwt = require('jsonwebtoken');

router.get('/asesores', async (req, res) =>{
    try{
        //consultar todos los registros de cateforías
        const [categorias ] =await db.query('SELECT * FROM categorias');
        let asesores = [];
        const limit = 9;
        let paginaActual = parseInt(req.query.page) || 1;
        let totalPaginas = 0, offset = (paginaActual - 1) * limit;
        

        //si no trae el parámetro page, es entonces la número 1
        


        /*se lee la categorías que el usuario seleccionó en la url, 
        por ejemplo, ?categoria=emprendimiento
        Si no encuentra, se sobreentiende que quiere ver todos los asesores
        */

        //esta línea es la que extrae eso, el || asigna un valor por defecto cuando no 
        // se escribe un filtro ?filtro=valor en la url
        let categoriaSeleccionada = req.query.categoria || 'todas';
        const existeCategoria = categorias.some(cat => cat.nombreCat === categoriaSeleccionada);

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
            asesores
        });
    }catch(error){
        console.error("Error al cargar la página de asesores.", error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
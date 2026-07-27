const express = require('express');
const router = express.Router();
const db = require('../config/db');
// const jwt = require('jsonwebtoken');

router.get('/asesores', async (req, res) =>{
    try{
        //consultar todos los registros de cateforías
        const [categorias ] =await db.query('SELECT * FROM categorias');
        const [asesores] = await db.query(
            `SELECT nombre, apellidop, apellidom, gradoEscolar, 
            descripcion, inicioTurno, finTurno, cat.nombreCat 
            FROM asesores
            JOIN categorias cat ON asesores.idCategoria = cat.id
            `
        );
        /*se lee la categorías que el usuario seleccionó en la url, 
        por ejemplo, ?categoria=emprendimiento
        Si no encuentra, se sobreentiende que quiere ver todos los asesores
        */

        //esta línea es la que extrae eso, el || asigna un valor por defecto cuando no 
        // se escribe un filtro ?filtro=valor en la url
        const categoriaSeleccionada = req.query.categoria || 'todas';

        console.log(categorias)
        //se envían los datos de la vista para que en ejs sean dibujados y plasmados en el navtabs
        res.render('asesores/index', {
            categorias,
            categoriaSeleccionada, 
            asesores
        });
    }catch(error){
        console.error("Error al cargar la página de asesores.", error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
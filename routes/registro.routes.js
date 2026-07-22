const express = require('express');
const router = express.Router();
const db = require('../config/db');

//ruta para mostrar el form de registro
router.get('/registro', (req, res) =>{
    res.render('registro');
});

//ruta que procesará el registro
router.post('/registro', async (req, res) => {
    try{
        //1 - extra los datos que bienen del for, un req.body
        const {nombre, apellidop, apellidom, fechaNacimiento, usuario, correo, contrasena } = req.body;

        //señal de que sí los recibió, meramente control
        console.log("DATOS RECIBIDOS: ", req.body);

        //2 - inserción en la bd, los ? evitan inyección SQL
        const query = `INSERT INTO 
            usuarios (usuario, nombre, apellidop, apellidom, fechaNacimiento,correo, contrasena)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [usuario, nombre, apellidop, apellidom, fechaNacimiento,correo, contrasena]);

        //3 - respuesta temporal para checar si funcionó
        res.send("USUARIO REGISTRADO");

    }catch (error){
        console.error("ERROR AL REGISTRAR USUARIO: ", error);
        res.status(500).send("ERROR EN EL SERVIDOR AL QUERER HACER EL REGISTRO");
    }
});

module.exports = router;
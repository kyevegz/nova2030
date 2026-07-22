const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

//ruta para mostrar el form de registro
router.get('/registro', (req, res) =>{
    res.render('registro');
});

//ruta que procesará el registro
router.post('/registro', async (req, res) => {
    try{
        //1 - extra los datos que bienen del for, un req.body
        const {nombre, apellidop, apellidom, fechaNacimiento, usuario, correo, correoConfirmar, contrasena, contrasenaConfirmar } = req.body;

        //1.? palabras reservadas para nombre de usuario
        const palabrasReseverdas = ['admin', 'root', 'soporte', 'nova2030', 'nova', 'administrador', 'sistema'];
        if(palabrasReseverdas.includes(usuario.toLowerCase())){
            return res.status(400).send("ERROR. Ese nombre de usuario es reservado y no se permite");
        }

        //1. contraseña robusta, verificar su tamaño y que contenga caracteres seguros
        const contieneMayus = /[A-Z]/.test(contrasena);
        const contieneMinus = /[a-z]/.test(contrasena);
        const contieneNumeros = /[0-9]/.test(contrasena);
        const contieneSimbolos = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

        //checar que cumpla con todas las reglas
        if(contrasena.length < 8 ){
            return res.status(400).send("ERROR. La contraseña debe tener 8 caracteres mínimo");
        }
        if(!contieneMayus ){
            return res.status(400).send("ERROR. La contraseña debbe tener mínimo 1 mayúscula");
        }
        if( !contieneMinus ){
            return res.status(400).send("ERROR. La contraseña debbe tener mínimo 1 minúscula");
        }
        if(!contieneNumeros ){
            return res.status(400).send("ERROR. La contraseña debbe tener mínimo 1 númeri");
        }
        if(!contieneSimbolos){
            return res.status(400).send("ERROR. La contraseña debbe tener mínimo 1 símbolo especial");
        }
        //1.5 comparación de correos y contraseñas
        if(correo != correoConfirmar){
            return res.status(400).send("ERROR. los correos no coinciden");
        }

        if(contrasena != contrasenaConfirmar){
            return res.status(400).send("ERROR. Contrasenas no coinciden");
        }
        
        //2 - verifica que no haya nombre de usuario o correo ya registrado
        const checkQuery = `SELECT * FROM usuarios WHERE correo = ? OR usuario = ?`;
        const [usuariosExistentes] = await db.query(checkQuery, [correo, usuario]);

        //si el array tiene al menos un elemento, quiere decir que ya existe
        if(usuariosExistentes.length > 0){
            //detiene el proces y manda error 400 de bad request
            return res.status(400).send("ERROR. USUARIO O CORREO YA REGISTRADO");
        }

        //TRAS PASAR LA BARRERA DE VERIFICACIÓN

        /* 3- definición del número de rondas de salt, 10 es el estándar seguro y equilibrado
        un salt es una cadena de caracteres que se añade a la contraseña antes de procesarlam garantiza que el hash (versión cifrada) sea única*/
        const saltRounds = 10;

        //4 - encriptación de la contraseña
        const hashedContrasena = await bcrypt.hash(contrasena, saltRounds);
        
        
        
        //señal de que sí los recibió, meramente control
        //console.log("DATOS RECIBIDOS: ", req.body);

        //5 - inserción en la bd, los ? evitan inyección SQL
        const query = `INSERT INTO 
            usuarios (usuario, nombre, apellidop, apellidom, fechaNacimiento,correo, contrasena)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [usuario, nombre, apellidop, apellidom, fechaNacimiento,correo, hashedContrasena]);

        //3 - respuesta temporal para checar si funcionó
        res.send("USUARIO REGISTRADO con bcrypt");

    }catch (error){
        console.error("ERROR AL REGISTRAR USUARIO: ", error);
        res.status(500).send("ERROR EN EL SERVIDOR AL QUERER HACER EL REGISTRO");
    }
});

module.exports = router;
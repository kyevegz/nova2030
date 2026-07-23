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
        //0 Limpiar espacios en blanco (por si acaso)
        Object.keys(req.body).forEach( key => {
            if(typeof req.body[key] === 'string' && !key.includes('contrasena')){
                req.body[key] = req.body[key].trim();
            }
        });

        //0.1 - correo a minúsculas
        if(req.body.correo) req.body.correo = req.body.correo.toLowerCase();

        //1 - extrae los datos que bienen del for, un req.body
        const {nombre, apellidop, apellidom, fechaNacimiento, usuario, correo, correoConfirmar, contrasena, contrasenaConfirmar } = req.body;


        //1.5 validación de longitudes
        const reglasLongitud = [
            {campo: "nombre", valor: nombre, min:2, max:100, msg: "El nombre debe tener entre 2 y 100 caracteres"},
            {campo: "apellidop", valor: apellidop, min:2, max:100, msg: "El apellido paterno debe tener entre 2 y 100 caracteres"},
            {campo: "apellidom", valor: apellidom, min:2, max:100, msg: "El apellido materno debe tener entre 2 y 100 caracteres"},
            {campo: "correo", valor: nombre, min:5, max:150, msg: "El correo electrónico debe tener mínimo 5 caracteres y no puede superar los 150 caracteres"}
        ];

        for(let regla of reglasLongitud){
            if(regla.valor && (regla.valor.length <regla.min || regla.valor.length > regla.max)){
                return res.status(400).json({campo: regla.campo, error: regla.msg});
            }
        }

        //2 - palabras reservadas para nombre de usuario
        const palabrasReseverdas = ['admin', 'root', 'soporte', 'nova2030', 'nova', 'administrador', 'sistema'];
        if(palabrasReseverdas.includes(usuario.toLowerCase())){
            return res.status(400).json({campo: "usuario", error: "El nombre de usuario ingresado es reservado, por lo que su uso no es permitido"});
        }

        //3 - contraseña robusta, verificar su tamaño y que contenga caracteres seguros
        const contieneMayus = /[A-Z]/.test(contrasena);
        const contieneMinus = /[a-z]/.test(contrasena);
        const contieneNumeros = /[0-9]/.test(contrasena);
        const contieneSimbolos = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

        //checar que cumpla con todas las reglas
        if(contrasena.length < 8 ){
            return res.status(400).json({campo: "contrasena", error: "La contraseña debe tener mínimo 8 caracteres"});
        }
        if(!contieneMayus ){
            return res.status(400).send({campo: "contrasena", error:"La contraseña debbe tener mínimo 1 mayúscula"});
        }
        if( !contieneMinus ){
            return res.status(400).send({campo: "contrasena", error:"La contraseña debbe tener mínimo 1 minúscula"});
        }
        if(!contieneNumeros ){
            return res.status(400).send({campo: "contrasena", error:"La contraseña debbe tener mínimo 1 número"});
        }
        if(!contieneSimbolos){
            return res.status(400).send({campo: "contrasena", error:"La contraseña debbe tener mínimo 1 símbolo especial"});
        }


        //4 - comparación de correos y contraseñas
        if(correo !== correoConfirmar){
            return res.status(400).json({campo: "correoConfirmar", error: "Los correos no coinciden"});
        }

        if(contrasena != contrasenaConfirmar){
            return res.status(400).json({campo: "contrasenaConfirmar", error: "Las contraseñas no coinciden"});
        }
        
        //5 - verifica que no haya nombre de usuario o correo ya registrado
        //5.1 si el usuario existe
        const checkQueryUser = `SELECT * FROM usuarios WHERE usuario = ?`;
        const [usuariosExistentes] = await db.query(checkQueryUser, [usuario]);
        
        if(usuariosExistentes.length > 0){
            //detiene el proces y manda error 400 de bad request
            return res.status(400).json({campo: "usuario", error: "Este nombre de usuario ya está en uso"});
        }
        


        //5.2 verifica si el correo existe
        const checkQueryMail = `SELECT * FROM usuarios WHERE correo = ?`;
        const [CorreosExistentes] = await db.query(checkQueryMail, [correo]);

        //si el array tiene al menos un elemento, quiere decir que ya existe
        if(CorreosExistentes.length > 0){
            //detiene el proces y manda error 400 de bad request
            return res.status(400).json({campo: "correo", error: "Este correo ya se encuentra registrado"});
        }

        //TRAS PASAR LA BARRERA DE VERIFICACIÓN

        //6 - encriptación de contraseña
        /* 6.1 - definición del número de rondas de salt, 10 es el estándar seguro y equilibrado
        un salt es una cadena de caracteres que se añade a la contraseña antes de procesarlam garantiza que el hash (versión cifrada) sea única*/
        const saltRounds = 10;

        //6.2 - encriptación de la contraseña
        const hashedContrasena = await bcrypt.hash(contrasena, saltRounds);
        
        //señal de que sí los recibió, meramente control
        //console.log("DATOS RECIBIDOS: ", req.body);

        //7 - inserción en la bd, los ? evitan inyección SQL
        const query = `INSERT INTO 
            usuarios (usuario, nombre, apellidop, apellidom, fechaNacimiento, correo, contrasena)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [usuario, nombre, apellidop, apellidom, fechaNacimiento, correo, hashedContrasena]);

        //8 - respuesta de éxito
        return res.status(201).json({
            mensaje: "Cuenta creada con éxito",
            redirectUrl: "/index"
        });

        //res.send("USUARIO REGISTRADO con bcrypt");

    }catch (error){
        console.error("ERROR AL REGISTRAR USUARIO: ", error);
        res.status(500).json({error: "ERROR EN EL SERVIDOR AL QUERER HACER EL REGISTRO"});
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try{
        let { identificador, contrasena } = req.body;

        //1 - Validación básica
        if(!identificador || !contrasena){
            return res.status(400).json({ error: "Todos los campos son obligatorios"});
        }
        identificador = identificador.trim();

        // 2 - determinar si es correo o nombre de usuario
        const esCorreo = identificador.includes('@');
        const columnaFiltro = esCorreo ? 'correo': 'usuario';

        //si es correo, se pasa a minúsculas
        if(esCorreo){
            identificador = identificador.toLowerCase();
        }

        // 3 - Buscar en la base de datos dinamicamente
        const query = `SELECT id, ${columnaFiltro}, contrasena FROM usuarios WHERE ${columnaFiltro} = ?`;
        const [usuarios] = await db.query(query, [identificador]);

        // si el arreglo regresa vacío, el usuario no existe
        if(usuarios.length === 0){
            return res.status(401).json({
                error: "Credenciales incorrectas. Por favor, verifica tu información"
            });
        }

        const usuarioEncontrado = usuarios[0];

        //4 - Compara la contraseña ingresada con el hash de la base de datos
        const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

        if(!contrasenaValida){
            return res.status(401).json({              
                error: "Credenciales incorrectas. Por favor, verifica tu información"
            });
        }

        //5 - generar el tokem jwt
        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                [columnaFiltro]: usuarioEncontrado[columnaFiltro]
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'//el token expira en 2 horas
            }
        );

        //guarda el token en una cookie HttpOnly, la cual es más segura que localStorage
        res.cookie('jwt', token, {
            httpOnly: true,//el cliente js no la puede robar
            secure: process.env.NODE_ENV === 'production', //solo en https
            maxAge: 2 * 60 * 60 * 1000//2 horas dd vida en ms
        });

        // 6 - Respuesta exitosa enviando el token
        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            //token: token, //manda el jwt al cliente
            redirectUrl: "/"
        });

    }catch(error){
        console.error("ERROR EN LOGIN: ", error);
        res.status(500).json({error: "error en el servidor al intentar iniciar sesión"});
    }
});

module.exports = router;

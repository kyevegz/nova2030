const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

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
        const query = `SELECT ${columnaFiltro}, contrasena FROM usuarios WHERE ${columnaFiltro} = ?`;
        const [usuarios] = await db.query(query, [identificador]);

        // si el arreglo regresa vacío, el usuario no existe
        if(usuarios.length === 0){
            return res.status(401).json({
                campo: "identificador",
                error: "Credenciales incorrectas. Por favor, verifica tu información"
            });
        }

        const usuarioEncontrado = usuarios[0];

        //4 - Compara la contraseña ingresada con el hash de la base de datos
        const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

        if(!contrasenaValida){
            return res.status(401).json({
                campo: contrasena, 
                error: "Credenciales incorrectas. Por favor, verifica tu información"
            });
        }

        //Parte del JWT

        // - Respuesta exitosa
        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            redirectUrl: "/index"
        });

    }catch{
        console.error("ERROR EN LOGIN: ", error);
        res.status(500).json({error: "error en el servidor al intentar iniciar sesión"});
    }
});

module.exports = router;

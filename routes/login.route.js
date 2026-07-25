const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const redirigirLogueado = require('../middlewares/redirigirLogueado.js');
//const jwt = require('jsonwebtoken');

//importar la función chida de los tokens
const { generarYGuardarTokens } = require('../config/tokenUtils');

//redirigir logueado se coloca como parámetro antes de que renderice la vista
router.get('/login', redirigirLogueado, (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try{
        //extrae lo de "recordarme" del cuerpo de la petición
        let { identificador, contrasena, recordarme } = req.body;

        //1 - Validación básica
        if(!identificador || !contrasena){
            return res.status(400).json({ error: "Todos los campos son obligatorios"});
        }
        identificador = identificador.trim();

        // 2 - determinar si es correo o nombre de usuario
        const esCorreo = identificador.includes('@');
        const columnaFiltro = esCorreo ? 'correo': 'usuario';

        //si es correo, se pasa a minúsculas
        if(esCorreo) identificador = identificador.toLowerCase();
        

        // 3 - Buscar en la base de datos dinamicamente
        const query = `SELECT id, usuario, correo, contrasena FROM usuarios WHERE ${columnaFiltro} = ?`;
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


        //SESIÓN AVANZADA

        //6 - convertir el checkbox a un true o false estricto
        //let {identificador, contrasena, recordarme} = req.body;

        //"recordarme" se convierte a booleando porque por default regresa on o su contrario, 
        // este booleano es escrito por si viene del fetch
        const esRecordarme = recordarme === true || recordarme === 'true';

        //6 - se llama a la función , a la cual se delega la creación de tokens y cookies

        //se le pasa la decisón dinámica de mantener sesión, en este caso, esRecordarme
        await generarYGuardarTokens(usuarioEncontrado, res, esRecordarme);

        // 7 - Respuesta exitosa enviando el token
        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            //token: token, //manda el jwt al cliente
            redirectUrl: "/index"
        });

    }catch(error){
        console.error("ERROR EN LOGIN: ", error);
        res.status(500).json({error: "error en el servidor al intentar iniciar sesión"});
    }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const db = require('./db');

//función exportable para gener ambos tokens
async function generarYGuardarTokens(usuarioEncontrado, res, mantenerSesion ) {

    //1 - generar el access token de 15 minutos
    
    const accessToken = jwt.sign(
        {
            id: usuarioEncontrado.id,
            /*se asegura que usuario o correo vengan en el objeto, esto en el 
            caso del login donde no podemos predecir con qué se va a loguear*/
            usuario: usuarioEncontrado.usuario || usuarioEncontrado.correo
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '15m'//el token expira en 15 minutos por seguridad
        }
    );

    //2 - generar el refresh token
    //si el usuario ha marcado "recordarme, dura 30 días, si no, será de 
    // sesión, por lo que no llevara expiresIn"
    const opcionesRefresh = mantenerSesion ? { expiresIn: '30d' } : {};

    //console.log("HOLa", mantenerSesion);
    const refreshToken = jwt.sign(
        {
            id: usuarioEncontrado.id, // el refresh token solo necesita el id
            rememberMe: mantenerSesion
        },
        process.env.JWT_REFRESH_SECRET,//se usa la clave secreta
        opcionesRefresh
    );

    //3 - guardar el refresh token en la bd (rotación base)
    const insertQuery = `INSERT INTO refresh_tokens (idUsuario, token) VALUES (?, ?)`;
    await db.query(insertQuery, [usuarioEncontrado.id, refreshToken]);

    //4 - configuracion para las cookies en HttpOnly
    const cookieBaseConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    //5 - enviar cookie del access token 15 minutos fijos
    res.cookie('accessToken', accessToken, {
        ...cookieBaseConfig,
        maxAge: 15 * 60 * 1000 //15 minutos en segundos
    });

    // 6 - enviar la cookie del refresh de forma dinámica en base al recordarme
    const configRefreshCookie = { ...cookieBaseConfig};
    if (mantenerSesion) {
        configRefreshCookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    }

    res.cookie('refreshToken', refreshToken, configRefreshCookie);



}

module.exports = { generarYGuardarTokens };
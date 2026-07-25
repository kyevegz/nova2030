const jwt = require('jsonwebtoken');
const db = require('./db');

//función exportable para gener ambos tokens
async function generarYGuardarTokens(usuarioEncontrado, res, mantenerSesion = false) {

    //6 - generar el access token vida corta
    const token = jwt.sign(
        {
            id: usuarioEncontrado.id,
            [columnaFiltro]: usuarioEncontrado[columnaFiltro]
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '15m'//el token expira en 15 minutos por seguridad
        }
    );

    //7 - generar el refresh token
    //si el usuario ha marcado "recordarme, dura 30 días, si no, será de 
    // sesión, por lo que no llevara expiresIn"
    const opcionesRefresh = esRecordarme ? { expiresIn: '30d' } : {};

    const refreshToken = jwt.sign(
        {
            id: usuarioEncontrado.id, // el refresh token solo necesita el id
        },
        process.env.JWT_REFRESH_SECRET,//se usa la clave secreta
        opcionesRefresh
    );

    //8 - guardar el refresh token en la bd (rotación base)
    const insertQuery = `INSERT INT refresh_tokens (idUsuario, token) VALUES (?, ?)`;
    await db.query(insertQuery, [usuarioEncontrado.id, refreshToken]);

    const configRefreshCookie = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    res.cookie('accesToken', accessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000 //15 minutos en segundos
    });

    if (mantenerSesion) {
        cookieConfig.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    }

    res.cookie('refreshToken', refreshToken, configRefreshCookie);



}

module.exports = { generarYGuardarTokens };
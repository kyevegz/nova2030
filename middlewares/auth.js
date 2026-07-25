// Ya no necesitas importar jwt, db, ni generarYGuardarTokens aquí
// Porque app.js ya se encarga de todo eso antes de llegar acá.

async function verificarToken(req, res, next) {
    // 1. Revisamos si el middleware global de app.js logró verificar al usuario
    // (ya sea con el Access Token o haciendo la rotación exitosa del Refresh Token)
    if (res.locals.usuarioVerificado) {
        
        // Pasamos los datos al req.usuario por si alguna ruta tuya los necesita
        req.usuario = res.locals.usuarioVerificado;
        
        return next(); // Todo en orden, puede entrar a la ruta privada
    }

    // 2. Si res.locals.usuarioVerificado es null o no existe, 
    // significa que app.js determinó que no hay sesión viva.
    return limpiarCookiesYRedirigir(res);
}

//función auxiliar para no repetir el limpiado de cookies
function limpiarCookiesYRedirigir(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.redirect('/login');
}

module.exports = verificarToken;
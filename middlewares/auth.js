const jwt = require('jsonwebtoken');
const db = require('../config/db');

//importar la función
const { generarYGuardarTokens } = require('../config/tokenUtils');


async function verificarToken(req, res, next) {
    //busca el token en la cookie configurafas
    //const token = req.cookies.jwt;

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    if (refreshToken) {
        try {
            //1 - verificar la validez criptografica del refresh token
            const usuarioVerificado = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            //2 - verificar que exista en la bd (Seguridad contra revocaciones)
            const query = `SELECT * FROM refresh_tokens WHERE token = ? AND idUsuario = ?`;
            const [tokensDB] = await db.query(query, [refreshToken, usuarioVerificado.id]);

            if(tokensDB.length === 0){
                //si no está en la bd, fue revocado o es un ataque, así que emite fallo
                throw new Error("Refresh token no válido o revocado");
            }

            //3. rotación de tokens
            //primero se destruye el token viejo en la db para evitar la reutilización y con ello evitar ataques
            await db.query(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]);

            //en segundo lugar, se consultan los datos del usuario para el nuevo access token
            const [usuarios] = await db.query(`SELECT id, usuario FROM usuarios WHERE id = ?`, [usuarioVerificado.id]);
            const usuario =usuarios[0];

            //en tercer lugar, se genera un nuevo par de tokens usando la función de utils
            //pasa true para autologin

            await generarYGuardarTokens(usuario, res, true);
            //guarda los datos del usuario decodificados en la petición para usarlos luego
            req.usuario = {id: usuario.id, usuario: usuario.usuario};

            next(); // indica que todo está bien, que se puede pasar a la siguiente función
        } catch (error) {

            //si el toke es inv+alido o expiró, se borra la cookie y manda al login
            //res.clearCookie('jwt');
            return limpiarCookiesYRedirigir(res);
        }
    }
    // if(!token){
    //     //si no hay toke, redirigie al login
    //     return res.redirect('/login');
    // }
    return limpiarCookiesYRedirigir(res);

}

//función auxiliar para no repetir el limpiado de cookies
function limpiarCookiesYRedirigir(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.redirect('/login');
}

module.exports = verificarToken;
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next){
    //busca el token en los headers de la petición, o puede venir de una cookie

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({error: "Acceso denegado. No hay token de autenticación"});
    }

    try{
        //el guardián escanea el token con la clave secreta
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);

        //guarda los datos del usuario decodificados en la petición para usarlos luego
        req.usuario = usuarioVerificado;

        next(); // indica que todo está bien, que se puede pasar a la siguiente función
    }catch(error){
        return res.status(403).json({error: "Token invalido o expirado"});
    }
}

module.exports = verificarToken;
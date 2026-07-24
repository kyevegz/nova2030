const jwt = require('jsonwebtoken');

function verificarToken(req, res, next){
    //busca el token en la cookie configurafas
    const token = req.cookies.jwt;

    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        //si no hay toke, redirigie al login
        return res.redirect('/login');
    }

    try{
        //el guardián escanea el token con la clave secreta
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);

        //guarda los datos del usuario decodificados en la petición para usarlos luego
        req.usuario = usuarioVerificado;

        next(); // indica que todo está bien, que se puede pasar a la siguiente función
    }catch(error){

        //si el toke es inv+alido o expiró, se borra la cookie y manda al login
        res.clearCookie('jwt');
        return res.redirect('/login');
    }
}

module.exports = verificarToken;
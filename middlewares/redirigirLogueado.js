const jwt = require('jsonwebtoken');

/*
al ser un middleware para logueados es, en esencia, un middleware 
a la inversa, donde se bloquea el acceso a login y registro si 
ya tiene una sesión activa
*/

const redirigirLogueado = (req, res, next) => {
    //extracción de cookies de forma directa, desestructuración moderna
    const {accessToken, refreshToken} = req.cookies;

    try{
        //1 - checa que haya un accessToken válido
        if(accessToken){
            jwt.verify(accessToken, process.env.JWT_SECRET);
            return res.redirect('./index');//ya tiene una sesión, se va al index
        }

        //2 - Si el access token expiró, puede que aún tenga un refresh válido
        if(refreshToken){
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            return res.redirect('./index');//sigue con sesión, va para el index   
        }

        // 3 - si no hay cookie o pasó los if anteriores, es un visitante legítimo
        next(); //se le concede el acceso para que sea libre de ver el formulario de login o registro

    }catch(error){
        /*
        si jwt.verify() falla, ya sea por token alterado o expirado, se captura el 
        error en silencio y se deja iniciar sesión de nuevo
        */
        next();
    }
};

module.exports = redirigirLogueado;
const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//-----------CONFIGURACIÓN DE PLANTILLAS EJS-----------------
app.set('view engine', 'ejs')//indica que se usará ejs como motor de plantillas
app.use(express.static('public'));//hace pública la carpeta public para poder acceder a los archivos estáticos (css, js, imágenes, etc.)






//importar la conexxion a bd
const db = require('./config/db');
const PORT = process.env.PORT || 3000;
//Middlewares para entender datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//importar la función de tokens para revivir las sesiones globalmente
const { generarYGuardarTokens } = require('./config/tokenUtils.js')

//Middleware global para el header dinámico
app.use(async (req, res, next) => {
    try {
        //console.log("soy el 1");
        const accessToken = req.cookies.accessToken;//busca la cookie llamada jwt
        const refreshToken = req.cookies.refreshToken;//busca la cookie llamada jwt

        if (accessToken) {
            try {
                //si el token existe, se verifica y se guardan los datos en res.locals
                const usuarioVerificado = jwt.verify(accessToken, process.env.JWT_SECRET);
                //console.log(usuarioVerificado)
                res.locals.usuarioVerificado = usuarioVerificado;
                return next();
            } catch (error) {
                //el token expiró, pasa al siguiente paso para revivirlo
            }
        }

        
        if (refreshToken) {

            try {
                const usuarioVerificado = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

                //validar que el refresh token siga vivo en la bd
                const [tokenDB] = await db.query(
                    `SELECT * FROM refresh_tokens WHERE token = ? AND idUsuario = ?`,
                    [refreshToken, usuarioVerificado.id]
                );

               // console.log( "tokendb: ", tokenDB.length);
                if (tokenDB.length > 0) {
                    //destruye el token viejo y busca los datos del usuario
                    await db.query(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]);
                    const [usuarios] = await db.query(`SELECT id, usuario, faseActual FROM usuarios WHERE id = ?`, [usuarioVerificado.id]);
                    // console.log("del select en index", usuario)
                    const usuario = usuarios[0];

                    if (usuario) {
                        //genera el neuvo par de tokens y cookies sin interrumpir al usuario
                        await generarYGuardarTokens(usuario, res, usuarioVerificado.rememberMe);

                        //actualoza el header de manera global
                        res.locals.usuarioVerificado = { id: usuario.id, usuario: usuario.usuario, faseActual: usuario.faseActual };
                        return next();
                    }
                }
            } catch (error) {
                //no hay sesión
            }
        }

        //si todo falla, el usuario es invitado
        res.locals.usuarioVerificado = null;
        next();
    } catch (error) {
        //si truena el server, se deja el usuario como invitado
        res.locals.usuarioVerificado = null;
        next();
    }

});




//importar la ruta de fase
const fasesRoutes = require('./routes/fases.routes.js');
app.use('/', fasesRoutes);

//importar la ruta de registro
const registroRoutes = require('./routes/registro.route.js');
app.use('/', registroRoutes);

//importar la ruta de login
const loginRoute = require('./routes/login.route.js');
app.use('/', loginRoute);

//ruta index
const indexPage = require('./routes/index.route.js');
app.use('/', indexPage);

//ruta buzon mail
const buzon = require('./routes/buzon.route.js');
app.use('/', buzon);

//importar la ruta de asesores
const asesores =  require('./routes/asesores.route.js');
app.use('/', asesores);
//para ver la página de registro
// app.get('/registro', (req, res) => {
//     res.render('registro');
// });


//importar la ruta del chatbot
const chatbotRoutes = require('./routes/chatbot.routes.js');
app.use('/', chatbotRoutes);

/*este fragmento modifica la ruta principal para que, en lugar de mandar 
texxto, "renderice" la vista del index.ejs*/
// app.get('/', (req, res) => {
//     res.render('index');
// });



//prueba para verificar que express y mysql están funcionando
app.get('/test', async (req, res) => {
    try {
        //consulta
        const [rows] = await db.query('SELECT "Hola pipo" AS test');
        res.json({
            status: "Servidor conectado",
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            status: "Error en el servidor",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

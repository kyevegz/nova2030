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
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

//Middleware global para el header dinámico
app.use((req, res, next) => {
    const token = req.cookies.jwt;//busca la cookie llamada jwt

    if(token){
        try{
            //si el token existe, se verifica y se guardan los datos en res.locals
            const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.usuarioVerificado = usuarioVerificado;
        }catch(error){
            //si el token retorna false o expiró, se elimina la variable
            res.locals.usuarioVerificado = null;
        }
    }else{
        res.locals.usuarioVerificado = null;
    }
    next();
});




//importar la ruta de fase 1
const fasesRoutes = require('./routes/fases.routes.js');
app.use('/', fasesRoutes);

//importar la ruta de registro
const registroRoutes = require('./routes/registro.routes.js');
app.use('/', registroRoutes);

//importar la ruta de login
const loginRoute = require('./routes/login.route.js');
app.use('/', loginRoute);

//ruta index
const indexPage = require('./routes/index.route.js');
app.use('/', indexPage);

//para ver la página de registro
// app.get('/registro', (req, res) => {
//     res.render('registro');
// });



/*este fragmento modifica la ruta principal para que, en lugar de mandar 
texxto, "renderice" la vista del index.ejs*/
app.get('/', (req, res) => {
    res.render('index');
});



//prueba para verificar que express y mysql están funcionando
app.get('/test', async (req, res) => {
    try{
        //consulta
        const [rows] = await db.query('SELECT "Hola pipo" AS test');
        res.json({
            status: "Servidor conectado",
            data: rows
        });
    }catch(error){
        res.status(500).json({
            status: "Error en el servidor",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})

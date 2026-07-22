const express = require('express');
const app = express();
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

//importar la ruta de fase 1
const fasesRoutes = require('./routes/fases.routes.js');
app.use('/', fasesRoutes);


//para ver la página de registro
app.get('/registro', (req, res) => {
    res.render('registro');
});

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

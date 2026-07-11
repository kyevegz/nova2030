const express = require('express');
const app = express();
require('dotenv').config();

//importar la conexxion a bd
const db = require('./config/db');
const PORT = process.env.PORT || 3000;
//Middlewares para entender datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({extended:true}));

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

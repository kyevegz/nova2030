const express = require('express');
const router = express.Router();
const db = require('../config/db');

const rutasValidas = ['enviar', 'faq'];

router.get('/buzon/:option', async (req, res) => {
    const {option} = req.params;

    let datosVista= {};
    if(!rutasValidas.includes(option)){
        return res.status(404).render('404');
    }

    if(option === 'faq'){
        const [resultados] = await db.query(`
            SELECT pregunta, respuesta, orden
            FROM preguntas_frecuentes 
            WHERE activa = 1
            ORDER BY orden ASC
        `);

        datosVista.preguntas = resultados;
        
    }
res.render(`buzon/${option}`,datosVista);
});

module.exports = router;
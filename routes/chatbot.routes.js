const express = require('express');
const router = express.Router();
const {GoogleGenAI} = require('@google/genai');

//se importa para proteger la ruta de los no logueados
const verificarToken = require('../middlewares/auth.js');

//inicializar el sdk de gemini con la variable de entorno secreta
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});


//ruta post para recibir los mensajes, se protege con la función de verificar token
router.post('/api/chat', verificarToken, async (req, res) => {
    try{
        const {mensaje} = req.body;

        //validcación de seguridad para evitar procesar peticiones vacías
        if(!mensaje || mensaje.trim() === ''){
            return res.status(400).json({
                error: "El mensaje no puede estar vacío"
            });
        }

        //llamar al modelo, pasando la configuración integrada
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: mensaje,
            config: {
                systemInstruction: `Eres MarIA, un asistente virtual amable y 
                experto en los Objetivos de Desarrollo Sostenible (ODS) y la 
                Agenda 2030. Trabajas para la plataforma Nova 2030. Tus 
                respuestas deben ser precisas, amigables y enfocadas en 
                guiar a los estudiantes a crear proyectos de impacto social. 
                Evita respuestas extremadamente largas.`
            }
        });

        const models = await ai.models.list();

console.log(models);
        //console.log(response)
        //console.log(" ", process.env.GEMINI_API_KEY)
        //enviar la repsuesta formateada al cliente
        return res.status(200).json({
            emisor: 'MarIA',
            mensaje: response.text
        });

    }catch(error){
        console.log("error en la comunicación con gemini", error);
        return res.status(500).json({
            error: "Hubo un problema al procesar tu solicitud con la IA, inténtalo más tarde"
        });
    }
});

module.exports = router;
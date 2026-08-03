const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const verificarToken = require('../middlewares/auth.js');

//importar el utils que hace los cálculos
const {procesarResultadosQ} = require('../utils/evaluadorQuiz.js');

//importar gemini
const {GoogleGenAI}= require('@google/genai')
const genAi = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
//ruta post para recibir las respuestas del quiz de habilidades, se protege con la función de verificar token
router.post('/api/enviar-quiz-habilidades', verificarToken, async (req, res) => {
    /*se ejecutan los cálculos fuera de la conexión para 
    no bloquear la base de datos*/
    const respuestaUsuario = req.body;
    const resultados = procesarResultadosQ(respuestaUsuario);
    const idUsuario = req.usuario.id; //se obtiene el id del usuario desde el token
    
    /*generar el perdil del usuario en base a sus respuestas*/
    let descripcionIA ="Eres una persona con un gran potencial para cambiar el mundo";//tespaldo por si algo falla
    try{
        const prompt = `
        Un estudiante obtuvo estos resultados:
            - Fortalezas: ${resultados.habilidades.join(', ')}.
            - Intereses: ${resultados.intereses.join(', ')}.
            - Tipo de proyecto ideal: ${resultados.proyectos.join(', ')}.
            
            Redacta un solo párrafo de máximo 3 líneas, en segunda persona ("Eres una persona..."), 
            conectando sus fortalezas con su proyecto ideal. Sé directo y empático.
        ` ;

        const responde = await genAi.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                systemInstruction: 'Eres un orientador vocacional de Nova 2030 experto en motivación. No uses viñetas ni negritas.'
            }
        });

        descripcionIA = responde.text;
    }catch(errorIa){
        console.error("Error al generar el perfil con Gemini, se usará el respaldo", errorIa);
    }

    /*pide la conexión al pool*/
    const conexion = await db.getConnection();
    try{
        //inicia la transacción SQL
    
        await conexion.beginTransaction();

        const stringPuntajes =JSON.stringify(resultados.puntajesBrutos);

        //guardar los datos en la tabla de resultados del quiz, la tabla maestra
        const [resultadoInsercion] = await conexion.query(
            `INSERT INTO resultado_quiz_hab (idUsuario, descripcionPerfil, puntajesRadar) VALUES (?, ?, ?)`,
            [idUsuario, descripcionIA, stringPuntajes]
        );
        const idResultado = resultadoInsercion.insertId;

        /*Una promesa, en este contexto, es un objeto que
        representa el resultado futuro de una operación
        asíncrona, como buscar, insertar o actualizar datps.
        Maneja la respuesta, independientemente de si la 
        operación es exitosa o no, sin bloquear el funcionamiento del
        programa o código en lo que la bd responde */

        /*se preparan las promesas para ejecutarlas en paralelo,
        ya que así se optimiza la ejecución*/
        const promesasHabilidades = resultados.habilidades.map(habilidad =>
            conexion.query(
                `
                INSERT INTO resultado_habilidades (idResultado, idHabilidad)
                VALUES (?, (SELECT id FROM catalogo_habilidades WHERE nombre = ?))
                `, [idResultado, habilidad]
            )
        );

        const promesasIntereses = resultados.intereses.map(interes =>
            conexion.query(
                `INSERT INTO resultado_intereses (idResultado, idInteres)
                VALUES (?, (SELECT id FROM catalogo_intereses WHERE nombre = ?))
                `, [idResultado, interes]
            )
        );

        const promesasProyectos = resultados.proyectos.map(proyecto =>
            conexion.query(
                `
                INSERT INTO resultado_proyectos (idResultado, idTiProyecto)
                VALUES (?, (SELECT id FROM catalogo_tiproyectos WHERE nombre = ?))
                `, [idResultado, proyecto]
            )
        );

        const promesasODS = resultados.ods.map(ods => 
            conexion.query(
                `
                    INSERT INTO resultado_ods (idResultado, ods)
                    VALUES (?, ?)
                `, [idResultado, ods]
            )
        );

        //unificar los nombres de las categorías ganadas
        const elementosGanadores = [
            ...resultados.habilidades,
            ...resultados.intereses,
            ...resultados.proyectos
        ]

        //promesa para insertar las insignias de todos los elementos que el usuario sacó


        const promesasInsignias = elementosGanadores.map(nombreElemento => 
            conexion.query(`
                    INSERT IGNORE INTO usuario_insignias (idUsuario, idInsignia)
                    VALUES (?,  (SELECT id FROM insignias WHERE nombre = ?))
                `, [idUsuario, nombreElemento]
            )
        );


        //ejecutar todas las inserciones juntas, el promiseall lo hace bastante rápido
        await Promise.all([
            ...promesasHabilidades,
            ...promesasIntereses,
            ...promesasProyectos,
            ...promesasODS,
            ...promesasInsignias
        ]);

        //si esas inserciones salen bien, entonces se confirma la transacción con commit
        await conexion.commit();

        //en caso de que la respuesta haya sido correcta, se envia el formulario
        res.redirect('/fase/1/resultados-quiz');
    
    }catch(error){

        //en caso de que haya fallado y por ende lanzado error, se deshace todo
        await conexion.rollback();
        console.error("Error al procesar y guardar los resultados del quiz", error);
        res.status(500).send("Ocurrió un error al guardar los resultados de tu quiz, lo lamentamos");
    }finally{
        //siempre se debe liberar la conexión
        conexion.release();
    }

});

module.exports = router;
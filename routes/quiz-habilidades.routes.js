const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const verificarToken = require('../middlewares/auth.js');

//importar el utils que hace los cálculos
const {procesarResultadosQ} = require('../utils/evaluadorQuiz.js');

//ruta post para recibir las respuestas del quiz de habilidades, se protege con la función de verificar token
router.post('/api/quiz-habilidades', verificarToken, async (req, res) => {
    /*se ejecutan los cálculos fuera de la conexión para 
    no bloquear la base de datos*/
    const respuestaUsuario = req.body;
    const resultados = procesarResultadosQ(respuestaUsuario);
    const idUsuario = req.usuario.id; //se obtiene el id del usuario desde el token
    
    /*pide la conexión al pool*/
    const conexion = await db.getConnection();
    try{
        //inicia la transacción SQL
        await conexion.beginTransaction();
        //guardar los datos en la tabla de resultados del quiz, la tabla maestra
        const [resultadoInsercion] = await conexion.query(
            `INSERT INTO resultado_quiz_hab (idUsuario) VALUES (?)`,
            [idUsuario]
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
                VALUES (?, SELECT id FROM catalogo_habilidades WHERE nombre = ?))
                `, [idResultado, habilidad]
            )
        );

        const promesasIntereses = resultados.intereses.map(interes =>
            conexion.query(
                `INSERT INTO resultado_intereses (idResultado, idInteres)
                VALUES (?, SELECT id FROM catalogo_intereses WHERE nombre = ?))
                `, [idResultado, interes]
            )
        );

        const promesasProyectos = resultados.proyectos.map(proyecto =>
            conexion.query(
                `
                INSERT INTO resultado_proyectos (idResultado, idTiProyecto)
                VALUES (?, SELECT id FROM catalogo_tiproyectos WHERE nombre = ?))
                `, [idResultado, proyecto]
            )
        );

        //ejecutar todas las inserciones juntas, el promiseall lo hace bastante rápido
        await Promise.all([
            ...promesasHabilidades,
            ...promesasIntereses,
            ...promesasProyectos
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
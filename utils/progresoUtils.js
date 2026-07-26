/*
INCLUYE LA FUNCIÓN QUE CALCÚLA EL PORCENTAJE Y QUE A LA VEZ HACE LA CONSULTA A LA BD
 */
const db = require('../config/db');

const calcularPorcentajeProgreso = (completados, totales) => {
    // 1- prevenir divisiones entre cero
    if (!totales || totales === 0) {
        return 0;
    }
    const porcentaje = Math.round((completados / totales) * 100);
    //límite de segurida que asegura que el porcentaje nunca supere el 100
    return Math.min(porcentaje, 100);
}


/*consulta a la bd*/
const progresoPorFaseUsr = async (idUsuario, numFase) => {
    const [[resultado]] = await db.query(`
        SELECT COUNT(*) AS totalModF, 
        SUM(progu.completado) AS totalModCompletos
        FROM progreso_usuarios progu
        JOIN modulos modul ON progu.idModulo = modul.id
        WHERE modul.fase = ? AND progu.idUsuario = ?
    `, [numFase, idUsuario]);

    if(!resultado) return 0;

    console.log("totales: ", resultado.totalModF)
    return calcularPorcentajeProgreso(resultado.totalModCompletos, resultado.totalModF);
}
module.exports = {
    calcularPorcentajeProgreso, progresoPorFaseUsr
};
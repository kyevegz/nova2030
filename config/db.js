/*pool de extensiones, mantiene un grupo de conexiones abiertas a 
la base de datos, para que no se tenga que abrir una nueva conexion 
cada vez que se hace una consulta*/

const mysql = require('mysql2');

//Creación del pool de conexiones usando variables del .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:0
});

//Verificar si se conectó en cuanto arranca el servidor
pool.getConnection((err, connection) =>{
    if(err){
        console.error("Valio popi: ", err.message);
    }else{
        console.log("Conexion valida a la bd");
        connection.release();//regresa la conexion al pool para que pueda ser usada por otra consulta
    }
});

//exportar el pool en versión promesas para usar async/await en otras rutas
const promisePool = pool.promise();
module.exports = promisePool;
    
    
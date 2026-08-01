const matrizHabilidades = {
    1: {
        A: {'Liderazgo': 2, 'Resolución de problemas':1},
        B: {'Creatividad':2, 'Innovación':1},
        C:{'Investigación': 2, 'Pensamiento analítico': 1},
        D: {'Comunicación': 2, 'Trabajo en equipo': 1}
    },
    2: {
        A: {'Liderazgo': 2, 'Resolución de problemas':1},
        B: {'Creatividad':2, 'Innovación':1},
        C:{'Investigación': 2, 'Pensamiento analítico': 1},
        D: {'Trabajo en equipo': 2, 'Comunicación': 1}
    },
    3: {
        A: {'Liderazgo': 2},
        B: {'Creatividad':2},
        C:{'Investigación': 2},
        D: {'Trabajo en equipo': 2}
    },
    4: {
        A: {'Innovación': 2},
        B: {'Creatividad':2},
        C:{'Investigación': 2},
        D: {'Comunicación':2}
    },
    5: {
        A: {'Pensamiento analítico': 2},
        B: {'Investigación':2},
        C:{'Creatividad': 2},
        D: {'Trabajo en equipo': 2}
    },
    8: {
        A: {'Creatividad': 2},
        B: {'Investigación':2}
        //C y D corresponden a intereses
    },
    10: {
        A: {'Trabajo en equipo': 2},
        B: {'Resolución de problemas':2},
        C:{'Investigación': 2},
        D: {'Liderazgo': 2}
    },
    11: {
        A: {'Liderazgo': 3},
        B: {'Creatividad':3},
        C:{'Pensamiento analítico': 3},
        D: {'Comunicación': 3}
    },
    12: {
        A: {'Innovación': 2},
        B: {'Investigación':2},
        C:{'Pensamiento analítico': 2},
        D: {'Trabajo en equipo': 2}
    }
};

const matrizIntereses = {
    //preguntas del área de intereses, junto a la la C y D de la 8) y las otras dos opciones de la 5
    5: {
        A: {'Tecnología': 1},
        B: {'Ciencia':1},
        C:{},
        D: {'Ciencias sociales': 1}
    },
    8: {
        C:{'Educación': 2},
        D: {'Emprendimiento': 2}
    },
    6: {
        A: {'Medio ambiente': 3},
        B: {'Ciencias sociales':3},
        C:{'Educación': 3},
        D: {'Tecnología': 3}
    },
    13: {
        A: {'Emprendimiento': 3},
        B: {'Tecnología':3},
        C:{'Ciencias sociales': 3},
        D: {'Ciencia': 3}
    },
};

const matrizProyectos = {
    //preguntas de proyectos, incluyendo lo que faltaba de la 5
    5: {
        C: {'Diseño y prototipado':1}
    },
    7: {
        A: {'Diseño y prototipado': 3},
        B: {'Tecnológico': 3},
        C: {'Científico': 3},
        D: {'Social': 3}
    },
    9:{
        A: {'Tecnológico': 3},
        B: {'Científico': 3},
        C: {'Social': 3},
        D: {'Ambiental':3}
    },
    14:{
        A: {'Tecnológico': 3},
        B: {'Científico': 3},
        C: {'Social': 3},
        D: {'Ambiental':3}
    }
};

const mapaOds = {
    'ods1': {'Social': 3},
    'ods2': {'Social': 3, 'Ambiental': 3},
    'ods3': {'Social': 3, 'Científico': 3},
    'ods4': {'Social': 3, 'Educativo': 3},
    'ods5': {'Social': 3},
    'ods6': {'Ambiental': 3, 'Científico': 3, 'Diseño y prototipado': 3},
    'ods7': {'Tecnológico': 3, 'Ambiental': 3,  'Diseño y prototipado': 3},
    'ods8': {'Social': 3,  'Emprendimiento': 3},
    'ods9': {'Tecnológico': 3, 'Científico': 3, 'Emprendimiento': 3, 'Diseño y prototipado': 3},
    'ods10': {'Social': 3},
    'ods11': {'Diseño y prototipado': 3, 'Ambiental': 3, 'Social': 3},
    'ods12': {'Ambiental': 3, 'Emprendimiento': 3, 'Diseño y prototipado': 3},
    'ods13': {'Ambiental': 3, 'Científico': 3},
    'ods14': {'Ambiental': 3, 'Científico': 3},
    'ods15': {'Ambiental': 3, 'Científico': 3},
    'ods16': {'Social': 3},
    'ods17': {'Social': 3, 'Científico': 3, 'Emprendimiento': 3}
}

//función para determinar la puntuación de cada habilidad según las respuestas del usuario
const obtenerPuntuacion = (puntuaciones) => {
    //si no hay puntaciones, retorna un array vacío
    if(Object.keys(puntuaciones).length === 0) return [];

    //encontrar el valor máximo 
    const maxPuntuacion = Math.max(...Object.values(puntuaciones));

    //filtra todas las categorías que tengan ese valor máximo, así, saca los empates
    return Object.keys(puntuaciones).filter(categoria => puntuaciones[categoria] === maxPuntuacion);
};

//el proceso matemático

const procesarResultadosQ = (respuestaUser) => {
    //sumar los puntos en base a las categorías
    const puntajes = {habilidades: {}, intereses: {}, proyectos: {}};

    //función que suma los puntos al contenedor por cada categoría
    const sumarPuntajes = (categoria, regla, respuesta) => {
        if(regla && regla[respuesta]){
            for(const [key, puntos] of Object.entries(regla[respuesta])){
                puntajes[categoria][key] = (puntajes[categoria][key] || 0) + puntos;
            }
        }
    };

    //iterar las 14 preguntas tipo radio button
    for(let i = 1; i <= 14; i++){
        const respuestasRdb = respuestaUser[`pregunta${i}`];
        if(!respuestasRdb) continue;

        //basándose en la pregunta, se suma a la categoría que corresponda
        sumarPuntajes('habilidades', matrizHabilidades[i], respuestasRdb);        
        sumarPuntajes('intereses', matrizIntereses[i], respuestasRdb);        
        sumarPuntajes('proyectos', matrizProyectos[i], respuestasRdb);        

    }

    //extraer los 3 ods que el usuario seleccionó en la pregunta 15, eso es un array
    /*se pone ese condicional porque en el ejs el name=pregunta15[], 
    pero dependiendo del body parser, se puede agrupar literal con el 
    [] o sin él*/
    const odsList = respuestaUser['pregunta15'] || respuestaUser['pregunta15[]'] || [];
    const odsSeleccionados = Array.isArray(odsList) ? odsList : [odsList];


    //reutilizar la función para sumar los puntajes de los ods,
    odsSeleccionados.forEach(ods => {
        sumarPuntajes('proyectos', mapaOds, ods);
    });
    //Calcula el valor que gana por categoría
    return {
        habilidades: obtenerPuntuacion(puntajes.habilidades),
        intereses: obtenerPuntuacion(puntajes.intereses),
        proyectos: obtenerPuntuacion(puntajes.proyectos),
        ods: odsSeleccionados
    };
};

module.exports = {procesarResultadosQ};


// 1. Simulamos lo que llegCaría del formulario HTML (req.body)
const mockRespuestas = {
    pregunta1: 'C', // Suma a Liderazgo y Resolución
    pregunta2: 'C', // Suma a Liderazgo y Resolución
    pregunta3: 'B', // Suma a Liderazgo
    pregunta4: 'D', // Suma a Liderazgo
    pregunta5: 'A', // Suma a Liderazgo
    pregunta6: 'D', // Suma a Tecnología (Interés)
    pregunta7: 'A', // Suma a Tecnología (Interés)
    pregunta8: 'C', // Suma a Tecnología (Interés)
    pregunta9: 'B', // Suma a Tecnológico (Proyecto)
    pregunta10: 'A', // Suma a Tecnológico (Proyecto)
    pregunta11: 'A', // Suma a Tecnológico (Proyecto)
    pregunta12: 'D', // Suma a Tecnológico (Proyecto)
    pregunta13: 'B', // Suma a Tecnológico (Proyecto)
    pregunta14: 'B', // Suma a Tecnológico (Proyecto)
    pregunta15: ['ods9', 'ods6', 'ods7'] // Suman a Tecnológico, Ambiental, Científico, Emprendimiento, Diseño
};

// 2. Ejecutamos la función y guardamos el resultado
const resultadoPrueba = procesarResultadosQ(mockRespuestas);

// 3. Imprimimos el resultado en la consola
console.log("=== RESULTADOS DEL TEST ===");
console.log(JSON.stringify(resultadoPrueba, null, 2));
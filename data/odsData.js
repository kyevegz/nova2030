const odsData = {
    "1":{
        numero: 1,//número de ods
        titulos: "",
        introduccion: [
            "",//párrafos separados por comas
            "",
            "" //quitar o añadir según sea la info
        ],
        secciones: [
            {//cada sección entre corchetes
                subtitulo: "Pregunta que se colocó en el doc",
                parrafos: [
                    //se separan igual por comas
                    "",
                    ""
                ]
            },
            {
                subitulo: "la otra pregunta",
                parrafos: [

                ]
            }
        ]
    },
    "2": {
        /*misma estructura que el primero, lo que varía es secciones, 
        ya que depende de cuántas preguntas clave tenga ese ods*/
    }
};

module.exports = odsData; //no quitar
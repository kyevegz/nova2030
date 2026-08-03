document.addEventListener('DOMContentLoaded', () => {
    //seleccionar elementos del DOM y validar que existan para no romper el archivo
    const trigger = document.getElementById('a11yTrigger');
    const opciones = document.getElementById('a11yOpciones');
    const btnIncrementar = document.getElementById('btnIncrementarFont');
    const btnDesincrementar = document.getElementById('btnDesincrementarFont');
    const btnResetear = document.getElementById('btnResetearFont');

    //si no existe el botón para activar la accesibilidad, detiene la ejecución
    if(!trigger) return;

    trigger.addEventListener('click', () => {
        opciones.classList.toggle('floating-menu__options--hidden');
    });

    //configuración de límites y saltos
    const rootElement = document.documentElement;//es la etiqueta del html
    const defaultSize = 16;
    const minSize = 12;
    const maxSixe = 24;
    const pasos = 2; //cuánto crece o disminuye por cada clic
    
    /*inicializar la variable de tamaño actual, busca si el usuario ya 
    tenía una preferencia guardada en el local storage*/
    let currentSize = parseInt(localStorage.getItem('novaFontSize')) || defaultSize;
    rootElement.style.fontSize = `${currentSize}`;

    //funcione que manipulan el tamaño
    const updateFontSize = (newSize) => {
        //validar que no sobrepase los límites
        if(newSize >= minSize && newSize <= maxSixe){
            //console.log(currentSize)
            currentSize = newSize;
            rootElement.style.fontSize = `${currentSize}px`;
            localStorage.setItem('novaFontSize', currentSize);
        }
    };

    btnIncrementar.addEventListener("click", () => {updateFontSize(currentSize + pasos)})
    btnDesincrementar.addEventListener("click", () => {updateFontSize(currentSize - pasos)})
    btnResetear.addEventListener("click", () => {updateFontSize(defaultSize)})



});
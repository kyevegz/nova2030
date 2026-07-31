document.addEventListener('DOMContentLoaded', () => {
    //seleccionar los elemntos del dom
    
    //contenedor donde se colocan la pregunta y sus opciones
    const steps = document.querySelectorAll('.quiz__step');
    //botones de adelante y atrás
    const btnPrev = document.getElementById('btnQuizPrev');
    const btnNext = document.getElementById('btnQuizNext');
    //formulario del quiz
    const form = document.querySelector('.quiz__form');
    //barra de progreso del formulario
    const progressbar = document.querySelector('.progress-bar__fill');

    //si no estamos en la vista del quiz, se aborta el proceso
    if(!steps.length) return;

    //para saber en qué pregunta o paso del form/quiz vamos
    let stepActual = 0;
    const totalSteps = steps.length;

    //función para actualizar la vista o el paso en el que vamos, o sea, la pregunta
    const actualizarVistaQuiz = () =>{
        //recorrer todos los pasos para ocultarlos o msotrarlos
        steps.forEach((paso, index) => {
            if(index === stepActual){
                paso.classList.remove('quiz__step--hidden');
                paso.classList.add('quiz__step--active');
                actAnimacionTambaleo(paso);
            }else{
                paso.classList.remove('quiz__step--active');
                paso.classList.add('quiz__step--hidden');
            }
        });

        //actualizar los botones
        btnPrev.disabled = stepActual === 0;//lo desactiva cuando la vista acutal sea la primera pregunta

        if(stepActual === totalSteps - 1){/*cuando la pregunta actual es la última, 
            debido a que el conteo empieza en 0, se le resta1*/
            btnNext.textContent = "Finalizar";
            btnNext.classList.add('quiz__btn--submit');
        }else{/*ponemos el else porque puede que el usuario llegue al final, 
            pero quiera retroceder, así que los textos deben ser "siguiente" 
            otra vez*/
            btnNext.textContent = "Siguiente";
            btnNext.classList.remove('quiz__btn--submit');
        }

        //actualizar la barra de progreso
        const progressBarAvance = ((stepActual + 1) / totalSteps) * 100;
        progressbar.style.width = `${progressBarAvance}`;
        progressbar.parentElement.setAttribute('aria-valuenow', progressBarAvance);


    };

    //animación de tambaleo (random in staggered)

    const actAnimacionTambaleo = (pasoActivo) => {
        const opciones = pasoActivo.querySelectorAll('.quiz__option');

        //si la animación ya existía, se remueve para reiniciarla
        opciones.forEach(op => op.style.animation = 'none');

        //forzar un reflow del navegador, es un truco de js que reinicia animaciones
        void pasoActivo.offsetWidth;

        //aplicar la animación con retraso escalonado
        opciones.forEach((op, index) => {
            //cada opción tiene una diferencia de 0.15ms
            op.style.animation = `slideInUp 0.4s ease forwards ${index * 0.15}s`;

        });
    };

    //manejar los eventos de siguiente y anterior pregunta
    btnNext.addEventListener("click", (e) => {
        e.preventDefault();
        //valida que el usaurio haya seleccionado mínimo una respuesta

        const inputsActuales = steps[stepActual].querySelectorAll('input:checked');
        if(inputsActuales === 0){
            //indicar que debe seleccionar al menos una respuesta
            alert("Por favor, selecciona una respuesta antes de proseguir.");
            return;
        }

        /*si el número de pregunta es menor al del total, quiere decir que debemos 
        de seguir iterando hasta terminar de imprimir las preguntas*/
        if(stepActual < totalSteps-1){
            stepActual++;
            actualizarVistaQuiz();
        }else{
            //si es la última pregunta, el form se envía al back
            confirmarEnvio();
        }
    });

    btnPrev.addEventListener("click", (e) => {
        if(stepActual > 0){//valida que no sea la primera pregunta
            stepActual--;
            actualizarVistaQuiz();
        }
    });

    //envío del quiz al node
    const confirmarEnvio = () =>{
        //un modal que lo confirme
        const confirmar = confirm('¿estás seguro de envíar tus respuestas?');
        if(confirmar){
            form.submit();//lanza el post hacia express pero desde js
        }
    };
    //en cuanto carga la pagina, incializa la visst
});

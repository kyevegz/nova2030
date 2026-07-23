document.addEventListener("DOMContentLoaded", () => {

    /*------------------------------------------
            MENÚ HAMBURGUESA -BOTÓN ABRIR
    -------------------------------------------*/
    const hamburgerBtn = document.querySelector(".nav-mini__hamburguer-button");//selecciona el botón del menú
    const sidebarMenu = document.querySelector(".sidebar--menu");//selecciona todo el sidebar

    if (hamburgerBtn && sidebarMenu) {//se ejecuta solo si ambos elementos existen en el DOM
        hamburgerBtn.addEventListener("click", (e) => {
            e.preventDefault();

            //alterna la clase del menú, es decir, la clase de activado o desactivado
            const isOpen = sidebarMenu.classList.toggle("sidebar--active");
            hamburgerBtn.classList.toggle("nav-mini__hamburguer-button--active", isOpen);

            //se cambia el ícono y el aria-label según el estado
            if (isOpen) {//cuando se abre el menú
                // iconBars.style.display = "none";//oculta las 3 barritas
                // iconBars.setAttribute("aria-hidden", "true"); //oculta del lector de pantalla

                // iconXmark.style.display = "block"; //muestra la tacha
                // iconXmark.removeAttribute("aria-hidden");//lo hace visible para lectores

                hamburgerBtn.setAttribute("aria-label", "Cerrar menú de navegación");//cambia el valor del aria label
            } else {//cuando está cerrado
                // iconXmark.style.display = "none";//quita la tacha
                // iconXmark.setAttribute("aria-hidden", "true");//regresa las barritas de hamburguesa

                // iconBars.style.display = "block"; //muestra las barras
                // iconBars.removeAttribute("aria-hidden");//lo hace visible para lectores

                hamburgerBtn.setAttribute("aria-label", "Abrir menú de navegación");//regresa el valor que tenía
            }
        });
    }

    /*------------------------------------------
        BOTÓN VER CONTRASEÑA CON FUNCIÓN
    -------------------------------------------*/
    //función para configuración del interruptor
    function configurarInterruptor(botonId, inputId) {
        //selección del botón e input
        const togglePassword = document.getElementById(botonId);
        const passwordInput = document.getElementById(inputId);

        if (togglePassword && passwordInput) {
            //console.log("archivo liugado");

            //aria label por cuestiones de accesibilidad
            togglePassword.setAttribute('aria-label', 'Mostrar contraseña');


            //escuchar el clic al interruptor 
            togglePassword.addEventListener('click', function () {
                //revisar el tipo de input, es decir, si se ve o no la contraseña
                const tipoActual = passwordInput.getAttribute('type');

                //selecciona el ícono dentro del botón
                const icono = this.querySelector('i, svg');
                //console.log('evento escuchado');

                //si es password, está 'oculta', si es text, ya está visible
                if (tipoActual === 'password') {
                    passwordInput.setAttribute('type', 'text');
                    icono.classList.replace('fa-eye', 'fa-eye-slash');
                    //this.textContent = '🙈';
                    this.setAttribute('aria-label', 'Ocultar contraseña');
                    //console.log('entré aquí')
                } else {
                    passwordInput.setAttribute('type', 'password');
                    icono.classList.replace('fa-eye-slash', 'fa-eye');
                    //this.textContent = '👁️';//regresa al ojonpara que pueda ver
                    this.setAttribute('aria-label', 'Mostrar contraseña');
                }
            });
        }
    }

    configurarInterruptor('interruptorContrasena', 'contrasena');
    configurarInterruptor('interruptorContrasenaConfirmar', 'contrasenaConfirmar');




    /*--------------------------------------------------
    FORMULARIO POR FASES CON VALIDACIÓN Y LOCALSTORAGE
    ---------------------------------------------------- */
    const form = document.getElementById('registroForm');
    const paso1 = document.getElementById('paso1');
    const paso2 = document.getElementById('paso2');
    const barraProgreso = document.getElementById('barraProgreso');
    const btnSig = document.getElementById('btnSig');
    const btnAnter = document.getElementById('btnAnter');
    const labelPaso1 = document.getElementById('labelPaso1');
    const labelPaso2 = document.getElementById('labelPaso2');

    if(form && paso1 && paso2){

        /* -----FUNCIONES DE ERROR------- */
        function mostrarErrorInput(inputId, mensaje){
            const input = document.getElementById(inputId);
            if(!input) return;

            input.classList.add('form__input--error');
            input.setAttribute('aria-invalid', 'true');

            let errorSpan = input.parentNode.querySelector('.form__error-text');
            if(!errorSpan){
                errorSpan = document.createElement('span');
                errorSpan.classList.add('form__error-text');
                errorSpan.id = `error-${inputId}`;
                errorSpan.setAttribute('role', 'alert');
                input.parentNode.appendChild(errorSpan);
            }

            errorSpan.innerHTML = `<i class = "fa-solid fa-circle-exclamation"></i> ${mensaje}`;
            input.setAttribute('aria-describedby', errorSpan.id);
            //input.focus();
        }

        function limpiarErrorIndividual(inputId){
            const input = document.getElementById(inputId);
            if(!input) return;

            input.classList.remove('form__input--error');
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');

            const errorSpan = input.parentNode.querySelector('.form__error-text');
            if(errorSpan) errorSpan.remove();
        }

        function limpiarErrores(){
            document.querySelectorAll('.form__input--error').forEach(input => {
                input.classList.remove('form__input--error');
                input.removeAttribute('aria-invalid');
                input.removeAttribute('aria-describedby');
            });
            document.querySelectorAll('.form__error-text').forEach(span => {
                span.remove();
            });
        }

        const inputs = form.querySelectorAll('input');
        
        //al cargar la página, busca los datos que se hayan guardado en el localstorage
        inputs.forEach(input => {
            const valorGuardado = localStorage.getItem(input.name);
            const esPassword = input.name.includes('contrasena');

            if(valorGuardado && !esPassword){
                input.value = valorGuardado;
            }

            //guardar los datos en tiempo real mientras el usuario está escirbiendi
            input.addEventListener("input", () => {
                if(!esPassword) localStorage.setItem(input.name, input.value.trim() );
                
                //si el usuario empieza a corregir, se quita el mensaje de error
                if(input.checkValidity()){
                    limpiarErrorIndividual(input.id);
                }
            });

            //validar al salir del campo
            input.addEventListener("blur", () => {
                if(!input.checkValidity()){
                    let mensaje = input.validationMessage || "Este campo es obligatorio o tiene un formato inválido";

                    //si el error es porque falló el pattern, se jala el mensaje del atributo
                    if(input.validity.patternMismatch && input.title){
                        mensaje = input.title;
                    }else if (!mensaje){
                        mensaje = "Por favor, completa este campo correctamente";
                    }
                    //si está vació o inválido, se muestra el error personalizado
                    mostrarErrorInput(input.id, mensaje);

                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 400);

                }
            });
        });

        //botón de siguiente, valida el paso 1 antes de seguir
        btnSig.addEventListener("click", () =>{
            const inputsPaso1 = paso1.querySelectorAll("input");
            let todosValidos = true;

            inputsPaso1.forEach(input =>{
                if(!input.checkValidity()){
                    todosValidos = false;
                    const mensaje ="Por favor, complete este campo correctamente";
                    mostrarErrorInput(input.id, mensaje);

                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 400);
                }
            });

            if(todosValidos){
                paso1.classList.replace('form__step--active', 'form__step--hidden');
                paso2.classList.replace('form__step--hidden', 'form__step--active');
                

                //actualizar la barra de progreso a 100%

                barraProgreso.style.width = "100%";
                labelPaso1.classList.remove('form-progress__label--active');
                labelPaso2.classList.add('form-progress__label--active');
            }else{
                //si hay errores, sacude el campo

            }
        });

        //botón de anterior

        btnAnter.addEventListener("click", () => {
            paso2.classList.replace('form__step--active', 'form__step--hidden');
            paso1.classList.replace('form__step--hidden', 'form__step--active');

            barraProgreso.style.width = "50%";
            labelPaso2.classList.remove('form-progress__label--active');
            labelPaso1.classList.add('form-progress__label--active');
        });

            //jala los elementos para validarlos en tiempo real
            const correo = document.getElementById('correo');
            const correoConfirmar = document.getElementById('correoConfirmar');
            const contrasena = document.getElementById('contrasena');
            const contrasenaConfirmar = document.getElementById('contrasenaConfirmar');

            function validarCoincidencia(inputOrigen, inputDestino, mensajeError){
                const valorOrigen = inputOrigen.value.trim();
                const valorDestino = inputDestino.value.trim();

                const esCorreo = inputOrigen.id === 'correo';
                const noCoinciden = esCorreo
                    ? (valorDestino.toLocaleLowerCase() !== valorOrigen.toLowerCase())
                    : (valorDestino !== valorOrigen);
                
                if(noCoinciden && valorDestino   !== ''){
                    inputDestino.setCustomValidity(mensajeError);
                    mostrarErrorInput(inputDestino.id, mensajeError);
                }else{
                    inputDestino.setCustomValidity('');//limpia el error por si se generó y ya coincidieron
                    limpiarErrorIndividual(inputDestino.id);
                }
            }

            //escuchas cruzadas para correos
            if(correo && correoConfirmar){
                correoConfirmar.addEventListener('input', () => validarCoincidencia(correo, correoConfirmar, "Los correos no coinciden"));
                correo.addEventListener('input', () => {
                    if(correoConfirmar.value.trim() !== '') {
                        validarCoincidencia(correo, correoConfirmar, "Los correos no coinciden");
                    }
                });
            }
            //escucha cruzada para contraseña sensible a mayus
            if(contrasena && contrasenaConfirmar){
                contrasenaConfirmar.addEventListener('input', () => validarCoincidencia(contrasena, contrasenaConfirmar, "Las contraseñas no coinciden"));
                contrasena.addEventListener('input', () => {
                    if(contrasenaConfirmar.value.trim() !== '') {
                        validarCoincidencia(contrasena, contrasenaConfirmar, "Las contraseñas no coinciden");
                    }
                });
            }

            const usuarioInput = document.getElementById('usuario');

            if(usuarioInput){
                usuarioInput.addEventListener("input", () => {
                    const valorUsuarioInput = usuarioInput.value.trim();
                    const palabrasReservadas = ['admin', 'root', 'soporte', 'nova2030', 'nova', 'administrador', 'sistema'];
                    if(palabrasReservadas.includes(valorUsuarioInput.toLowerCase())){
                        usuarioInput.setCustomValidity("Este nombre de usuario es reservado y no está permitido.");
                        //mostrarErrorInput(usuarioInput.id, usuarioInput.validationMessage);
                    }else if(valorUsuarioInput.length > 0 && (valorUsuarioInput.length < 3 || valorUsuarioInput.length > 20)){
                        usuarioInput.setCustomValidity("Longitud de nombre de usuario superada, debe tener un mínimo de 3 caracteres y un máximo de 20");
                    }else{
                        usuarioInput.setCustomValidity('');
                        if(usuarioInput.checkValidity()) limpiarErrorIndividual(usuarioInput.id);
                    }

                    if(!usuarioInput.checkValidity()){
                        mostrarErrorInput(usuarioInput.id, usuarioInput.validationMessage);
                    }else{
                        limpiarErrorIndividual(usuarioInput.id);
                    }

                });
            }
            //validar correos iguales en tiempo real
            // correoConfirmar.addEventListener("input", () =>{
            //     if(correoConfirmar.value !== correo.value){
            //         correoConfirmar.setCustomValidity("Los correos electrónicos no coinciden")
            //     }else{
            //         correoConfirmar.setCustomValidity("");//limpia el error por si se generó y ya coincidieron
            //     }
            // });

            // //validar contraseñas iguales en tiempo real escribiendo en el campo de confirmación
            // contrasenaConfirmar.addEventListener("input", () =>{
            //     if(contrasenaConfirmar.value !== correo.value){
            //         contrasenaConfirmar.setCustomValidity("Las contraseñas no coinciden")
            //     }else{
            //         contrasenaConfirmar.setCustomValidity("");//limpia el error por si se generó y ya coincidieron
            //     }
            // });


        //venvío por fetch AJAX moderno
        form.addEventListener("submit", async (e) =>{
            e.preventDefault();//evita que la página se recargue

            limpiarErrores();
            //verifica si todo el form es válido
            if(!form.checkValidity()){
                form.reportValidity();//muestra el aviso en el primer campo con error
                return;
            }

            //si pasa todas las validaciones, se empaqueta y se manda por fetch
            const formData = new FormData(form);
            const datosObjeto = Object.fromEntries(formData.entries());

            /*Limpiar espacios en blanco antes de enviarlo */

            Object.keys(datosObjeto).forEach(key => {
                //si es texto y no contraseña, quita espacios de los extremos
                if(typeof datosObjeto[key] === 'string' && !key.includes('contrasena')){
                    datosObjeto[key] = datosObjeto[key].trim();
                }

                //pasar correos a minúscula

                if(key === 'correo'){
                    datosObjeto[key] = datosObjeto[key].toLocaleLowerCase();
                }

            });

            try{
                const respuesta = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosObjeto)
                });

                const resultado = await respuesta.json();

                if(respuesta.ok){
                    inputs.forEach(input => localStorage.removeItem(input.name));

                    //alerta de éxito con sweetAlert (sin estilo todavpia)
                    Swal.fire({
                        title: "Registro exitoso",
                        text: resultado.mensaje,
                        iconHtml: '<i class="fa-solid fa-circle-check"></i>',
                        buttonsStyling: false, 
                        customClass:{
                            popup: 'swal-popup-personalized',
                            title: 'swal-title-personalized',
                            confirmButton: 'swal-button-personalized',
                            icon: 'swal-icon-fa'
                        },
                        confirmButtonText: "Continuar"
                    }).then(() => {
                        window.location.href = resultado.redirectUrl || '/index';
                    });
                    
                }else{
                    //aquí se pone el error dinámico
                    if(resultado.campo){
                        mostrarErrorInput(resultado.campo, resultado.error);

                    }else{
                        Swal.fire({
                            title: "Error. Algo salió mal",
                            text: resultado.error,
                            iconHtml: '<i class = "fa-solid fa-circle-xmark"></i>',
                            buttonsStyling: false,
                            customClass:{
                                popup: 'swal-popup-personalized',
                                title: 'swal-title-personalized swal-title-personalized--error',
                                confirmButton: 'swal-button-personalized',
                                icon: 'swal-icon-fa swal-icon-fa--error'
                            },
                            confirmButtonText: "Entendido"
                        });
                    }
                    //fallo al registrarse
                    //console.error(resultado.error) || "Ocurrió un error al intentar el registro";
                }
            }catch{
                console.error("Error en la petición", error);
                Swal.fire({
                    title: "Problema de conexión",
                    text: "No se pudo conectar con el servidor",
                    icon: "warning"
                });
            }

        });

        //limpiar el localstorage al enviar con éxito el formulario        
        // form.addEventListener("submit", () => {
        //     inputs.forEach(input => {
        //         localStorage.removeItem(input.name);
        //     });
        // });
    }
});



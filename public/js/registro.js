import {
    mostrarErrorInput,
    limpiarErrores,
    verContrasena,
    limpiarErrorIndividual,
    obtenerMensajeError,
    validarCoincidencia,
    validarNombreUsuario,
    validarLongitud
} from "./ui-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
    verContrasena('interruptorContrasena', 'contrasena');
    verContrasena('interruptorContrasenaConfirmar', 'contrasenaConfirmar');

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

    if (form && paso1 && paso2) {

        const inputs = form.querySelectorAll('input');

        //al cargar la página, busca los datos que se hayan guardado en el localstorage
        inputs.forEach(input => {
            const valorGuardado = localStorage.getItem(input.name);
            const esPassword = input.name.includes('contrasena');

            if (valorGuardado && !esPassword) {
                input.value = valorGuardado;
            }

            //guardar los datos en tiempo real mientras el usuario está escirbiendi
            input.addEventListener("input", () => {
                if (!esPassword) localStorage.setItem(input.name, input.value.trim());

                //si el usuario empieza a corregir, se quita el mensaje de error
                if (input.checkValidity()) {
                    limpiarErrorIndividual(input.id);
                }
            });

            //validar al salir del campo
            input.addEventListener("blur", () => {
                if (!input.checkValidity()) {
                    const mensaje = obtenerMensajeError(input);

                    //si está vació o inválido, se muestra el error personalizado
                    mostrarErrorInput(input.id, mensaje);

                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 400);

                }
            });
        });

        //botón de siguiente, valida el paso 1 antes de seguir
        btnSig.addEventListener("click", () => {
            const inputsPaso1 = paso1.querySelectorAll("input");
            let todosValidos = true;

            inputsPaso1.forEach(input => {
                if (!input.checkValidity()) {
                    todosValidos = false;
                    const mensaje = obtenerMensajeError(input);
                    mostrarErrorInput(input.id, mensaje);
                    input.classList.add('shake');
                    setTimeout(() => input.classList.remove('shake'), 400);
                }
            });

            if (todosValidos) {
                paso1.classList.replace('form__step--active', 'form__step--hidden');
                paso2.classList.replace('form__step--hidden', 'form__step--active');


                //actualizar la barra de progreso a 100%

                barraProgreso.style.width = "100%";
                labelPaso1.classList.remove('form-progress__label--active');
                labelPaso2.classList.add('form-progress__label--active');
            } else {
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

        

        //escuchas cruzadas para correos
        if (correo && correoConfirmar) {
            correoConfirmar.addEventListener('input', () => validarCoincidencia(correo, correoConfirmar, "Los correos no coinciden"));
            correo.addEventListener('input', () => {
                if (correoConfirmar.value.trim() !== '') validarCoincidencia(correo, correoConfirmar, "Los correos no coinciden");
            });
        }
        //escucha cruzada para contraseña sensible a mayus
        if (contrasena && contrasenaConfirmar) {
            contrasenaConfirmar.addEventListener('input', () => validarCoincidencia(contrasena, contrasenaConfirmar, "Las contraseñas no coinciden"));
            contrasena.addEventListener('input', () => {
                if (contrasenaConfirmar.value.trim() !== '') validarCoincidencia(contrasena, contrasenaConfirmar, "Las contraseñas no coinciden");
                
            });
        }


        //flógica de usuario y longitud
        const usuarioInput = document.getElementById('usuario');
        if(usuarioInput){
            usuarioInput.addEventListener("input", () => validarNombreUsuario('usuario'));
        }

        validarLongitud('nombre', 2, 100, 'El nombre debe tener entre 2 y 100 caracteres');
        validarLongitud('apellidop', 2, 100, 'El apellido paterno debe tener entre 2 y 100 caracteres');
        validarLongitud('apellidom', 2, 100, 'El apellido materno debe tener entre 2 y 100 caracteres');
        validarLongitud('correo', 5, 150, 'El correo electrónico no puede superar los 150 caracteres');

        //venvío por fetch AJAX moderno
        form.addEventListener("submit", async (e) => {
            e.preventDefault();//evita que la página se recargue

            limpiarErrores();
            //verifica si todo el form es válido
            if (!form.checkValidity()) {
                const todosInputs = form.querySelectorAll('input');
                todosInputs.forEach(input => {
                    if (!input.checkValidity()) {
                        const mensaje = obtenerMensajeError(input);

                        mostrarErrorInput(input.id, mensaje);
                        input.classList.add('shake');
                        setTimeout(() => input.classList.remove('shake'), 400);
                    }
                });
                return;//frena el envío
            }

            //si pasa todas las validaciones, se empaqueta y se manda por fetch
            const formData = new FormData(form);
            const datosObjeto = Object.fromEntries(formData.entries());

            /*Limpiar espacios en blanco antes de enviarlo */

            Object.keys(datosObjeto).forEach(key => {
                //si es texto y no contraseña, quita espacios de los extremos
                if (typeof datosObjeto[key] === 'string' && !key.includes('contrasena')) {
                    datosObjeto[key] = datosObjeto[key].trim();
                }

                //pasar correos a minúscula

                if (key === 'correo') {
                    datosObjeto[key] = datosObjeto[key].toLocaleLowerCase();
                }

            });

            try {
                const respuesta = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosObjeto)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    inputs.forEach(input => localStorage.removeItem(input.name));

                    //alerta de éxito con sweetAlert (sin estilo todavpia)
                    Swal.fire({
                        title: "Registro exitoso",
                        text: resultado.mensaje,
                        iconHtml: '<i class="fa-solid fa-circle-check"></i>',
                        buttonsStyling: false,
                        customClass: {
                            popup: 'swal-popup-personalized',
                            title: 'swal-title-personalized',
                            confirmButton: 'swal-button-personalized',
                            icon: 'swal-icon-fa'
                        },
                        confirmButtonText: "Continuar"
                    }).then(() => {
                        window.location.href = resultado.redirectUrl || '/index';
                    });

                } else {
                    //aquí se pone el error dinámico
                    if (resultado.campo) {
                        mostrarErrorInput(resultado.campo, resultado.error);

                    } else {
                        Swal.fire({
                            title: "Error. Algo salió mal",
                            text: resultado.error,
                            iconHtml: '<i class = "fa-solid fa-circle-xmark"></i>',
                            buttonsStyling: false,
                            customClass: {
                                popup: 'swal-popup-personalized',
                                title: 'swal-title-personalized swal-title-personalized--error',
                                confirmButton: 'swal-button-personalized',
                                icon: 'swal-icon-fa swal-icon-fa--error'
                            },
                            confirmButtonText: "Entendido"
                        });
                    }
                }
            } catch {
                console.error("Error en la petición", error);
                Swal.fire({
                    title: "Problema de conexión",
                    text: "No se pudo conectar con el servidor",
                    icon: "warning"
                });
            }

        });
    }
})


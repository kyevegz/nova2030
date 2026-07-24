const { text } = require("express");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('loginForm');

    /* BOTÓN DE VER CONTRASEÑA */
    const togglePassword = document.getElementById('interruptorContrasena');
    const passwordInput = document.getElementById('contrasena');

    if(togglePassword && passwordInput){
        togglePassword.setAttribute('aria-label', 'Mostrar contraseña');

        togglePassword.addEventListener("click", function () {
            const tipoActual = passwordInput.getAttribute('type');
            const icono = this.querySelector('i, svg');

            if (tipoActual === 'password') {
                passwordInput.setAttribute('type', 'text');
                icono.classList.replace('fa-eye', 'fa-eye-slash');
                this.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                passwordInput.setAttribute('type', 'password');
                icono.classList.replace('fa-eye-slash', 'fa-eye');
                this.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    }

    /*FUNCIONES UI PARA ERRORES*/
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

        //envío del formulario con fetch

        if(form){
            form.addEventListener("submit", async (e) =>{
                e.preventDefault();
                limpiarErrores();

                const formData = new FormData(form);
                const datosObjetos = Object.fromEntries(formData.entries());

                try{
                    const respuesta = await fetch(form.action, {
                        method = "POST",
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify(datosObjetos)
                    });

                    const resultado =  await respuesta.json();

                    if(respuesta.ok){
                        Swal.fire({
                            title: "Bienvenido de nuevo",
                            text: resultado.mensaje,
                            iconHtml: '<i class = "fa-solid fa-circle-check"></i>',
                            buttonStyling: false,
                            customClass:{
                                popup: 'swal-popup-personalized',
                                title: 'swal-tittle-personalized',
                                confirmButton: 'swal-button-personalized',
                                icon: 'swal-icon-fa'
                            },
                            confirmButtonText: "Ir al inicio"
                        }).then(() => {
                            window.location.href = resultado.redirectUrl || '/';
                        });
                    }else{
                        if(resultado.campo){
                            mostrarErrorInput(resultado.campo, resultado.error);
                            const inputAfectado = document.getElementById(resultado.campo);
                            if(inputAfectado){
                                inputAfectado.classList.add('shake');
                                setTimeout(() => inputAfectado.classList.remove('shake'), 400);
                            }
                        }else{
                            Swal.fire({
                                title: "Error al iniciar sesión",
                                text: resultado.error,
                                iconHtml: '<i class = "fa-solid fa-circle-xmark"></i>',
                                buttonStyling: false,
                                customClass:{
                                    popup: 'swal-popup-personalized',
                                    title: 'swal-tittle-personalized swal-tittle-personalized--error',
                                    confirmButton: 'swal-button-personalized',
                                    icon: 'swal-icon-fa swal-icon-fa--error'
                                },
                                confirmButtonText: "Entendido"
                            });
                        }
                    }
                }catch (error){
                    console.error("ERROR EN LA PETICIÓN", error);
                    Swal.fire({
                        title: "Problema de conexión",
                        text: "No se pudo conectar con el servidor",
                        icon: "warning"
                    });
                }
            })
        }


})
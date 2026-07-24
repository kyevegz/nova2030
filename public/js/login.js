import { mostrarErrorInput, limpiarErrores, verContrasena } from "./ui-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('loginForm');

    /* BOTÓN DE VER CONTRASEÑA */
    verContrasena('interruptorContrasena', 'contrasena');

    

    //envío del formulario con fetch

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            limpiarErrores();

            const formData = new FormData(form);
            const datosObjetos = Object.fromEntries(formData.entries());

            try {
                const respuesta = await fetch(form.action, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosObjetos)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    Swal.fire({
                        title: "Bienvenido de nuevo",
                        text: resultado.mensaje,
                        iconHtml: '<i class = "fa-solid fa-circle-check"></i>',
                        buttonsStyling: false,
                        customClass: {
                            popup: 'swal-popup-personalized',
                            title: 'swal-tittle-personalized',
                            confirmButton: 'swal-button-personalized',
                            icon: 'swal-icon-fa'
                        },
                        confirmButtonText: "Ir al inicio"
                    }).then(() => {
                        window.location.href = resultado.redirectUrl || '/';
                    });

                } else {
                    const camposResaltar = ['identificador', 'contrasena'];
                    //se aplican las clases de error a ambos
                    camposResaltar.forEach(id => {
                        const input = document.getElementById(id);
                        if (input) {
                            mostrarErrorInput(input.id, resultado.error);
                            input.classList.add('form__input--error', 'shake');
                            setTimeout(() => input.classList.remove('shake'), 400);
                        }


                    });

                }
            } catch (error) {
                
                Swal.fire({
                    title: "Problema de conexión",
                    text: "No se pudo conectar con el servidor",
                    icon: "warning"
                });
            }
        })
    }


})
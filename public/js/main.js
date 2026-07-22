/*------------------------------------------
        MENÚ HAMBURGUESA -BOTÓN ABRIR
-------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.querySelector(".nav-mini__hamburguer-button");//selecciona el botón del menú
    const sidebarMenu = document.querySelector(".sidebar--menu");//selecciona todo el sidebar
    // const iconBars = hamburgerBtn.querySelector(".nav-mini__icon--bars");//selecciona la etiqueta i del ícono de barras
    // const iconXmark = hamburgerBtn.querySelector(".nav-mini__icon--xmark");//selecciona la x

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




    //es igual a la función anterior pero con el campo de confirmar
});



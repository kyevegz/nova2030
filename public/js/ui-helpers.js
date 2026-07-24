/*FUNCIONES UI PARA ERRORES*/
export function mostrarErrorInput(inputId, mensaje) {
    const input = document.getElementById(inputId);
    if (!input) { console.error(`¡ATENCIÓN! No se encontró en el HTML un input con el ID: ${inputId}`); return };

    input.classList.add('form__input--error');
    input.setAttribute('aria-invalid', 'true');

    let errorSpan = input.parentNode.querySelector('.form__error-text');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('form__error-text');
        errorSpan.id = `error-${inputId}`;
        errorSpan.setAttribute('role', 'alert');
        input.parentNode.appendChild(errorSpan);
    }

    errorSpan.innerHTML = `<i class = "fa-solid fa-circle-exclamation"></i> ${mensaje}`;
    input.setAttribute('aria-describedby', errorSpan.id);
}

export function limpiarErrores() {
    document.querySelectorAll('.form__input--error').forEach(input => {
        input.classList.remove('form__input--error');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
    });
    document.querySelectorAll('.form__error-text').forEach(span => {
        span.remove();
    });
}

export function verContrasena(interruptorId, inputId) {
    const togglePassword = document.getElementById(interruptorId);
    const passwordInput = document.getElementById(inputId);

    if (togglePassword && passwordInput) {
        togglePassword.setAttribute('aria-label', 'Mostrar contraseña');

        togglePassword.addEventListener("click", function () {
            const tipoActual = passwordInput.type;
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
    } else {
        console.warn(`[UI-Helpers] No se encontraron los elementos para el toggle: botón "${botonId}" o input "${inputId}".`);
    }
}

export function limpiarErrorIndividual(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.classList.remove('form__input--error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');

    const errorSpan = input.parentNode.querySelector('.form__error-text');
    if (errorSpan) errorSpan.remove();
}

export function obtenerMensajeError(input) {
    let mensaje = input.validationMessage

    if (input.validity.customError) {
        mensaje = input.validationMessage;
    } else if (input.validity.valueMissing) {
        mensaje = "Este campo es obligatorio"; //solo si no hay mensaje personalizado
    } else if (input.validity.patternMismatch && input.title) {
        mensaje = input.title; // si falla el regex, jala el title del html
    } else if (!mensaje) {
        mensaje = "Por favor, complete este campo correctamente"; //general, la última opción si todas las demás fallan
    }
    return mensaje;
}

export function validarCoincidencia(inputOrigen, inputDestino, mensajeError) {
    const valorOrigen = inputOrigen.value.trim();
    const valorDestino = inputDestino.value.trim();

    const esCorreo = inputOrigen.type === 'email';
    const noCoinciden = esCorreo
        ? (valorDestino.toLocaleLowerCase() !== valorOrigen.toLowerCase())
        : (valorDestino !== valorOrigen);

    if (noCoinciden && valorDestino !== '') {
        inputDestino.setCustomValidity(mensajeError);
        mostrarErrorInput(inputDestino.id, mensajeError);
    } else {
        inputDestino.setCustomValidity('');//limpia el error por si se generó y ya coincidieron
        limpiarErrorIndividual(inputDestino.id);
    }
}

export function validarNombreUsuario(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const valorUsuarioInput = usuarioInput.value.trim();
    const palabrasReservadas = ['admin', 'root', 'soporte', 'nova2030', 'nova', 'administrador', 'sistema'];
    if (palabrasReservadas.includes(valorUsuarioInput.toLowerCase())) {
        usuarioInput.setCustomValidity("Este nombre de usuario es reservado y no está permitido.");
        //mostrarErrorInput(usuarioInput.id, usuarioInput.validationMessage);
    } else if (valorUsuarioInput.length > 0 && (valorUsuarioInput.length < 3 || valorUsuarioInput.length > 20)) {
        usuarioInput.setCustomValidity("Longitud de nombre de usuario superada, debe tener un mínimo de 3 caracteres y un máximo de 20");
    } else {
        usuarioInput.setCustomValidity('');
        if (usuarioInput.checkValidity()) limpiarErrorIndividual(usuarioInput.id);
    }

    if (!usuarioInput.checkValidity()) {
        mostrarErrorInput(usuarioInput.id, usuarioInput.validationMessage);
    } else {
        limpiarErrorIndividual(usuarioInput.id);
    }
}

export function validarLongitud(inputId, min, max, msg){
    const input = document.getElementById(inputId);
            if(!input) return;

            
                input.addEventListener("input", () => {
                    const valorInput = input.value.trim();

                    //solo va a validar cuando haya texto escrito, pues si no, qué valida
                    if (valorInput.length > 0 && (valorInput.length < min || valorInput.length > max)) {
                        input.setCustomValidity(msg);
                    } else {
                        input.setCustomValidity('');
                    }

                    //mostrar u ocultar el error en tiempo real con el uso de otras funciones
                    if (!input.checkValidity()) {
                        mostrarErrorInput(input.id, input.validationMessage);
                    } else {
                        limpiarErrorIndividual(input.id);
                    }
                });
}
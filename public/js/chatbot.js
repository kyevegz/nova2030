document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbotBtn');
    const ventanaChat = document.getElementById('chatbotVentana');
    const btnCerrar = document.getElementById('chatbotCerrar');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');

    //abrir y cerrar

    trigger.addEventListener('click', () => {
        ventanaChat.classList.toggle('chatbot--hidden');
    });
    btnCerrar.addEventListener('click', () => {
        ventanaChat.classList.add('chatbot--hidden');
    });

    //simulación de envío de mensajes y vaciado del input
    form.addEventListener("submit", (e) => {
        e.preventDefault();//no se recarga la página

        if(input.ariaValueMax.trim() !== ""){
            //lógica del fetch para unirlo con el back

            console.log("mensaje enviado: ", input.value);

            input.value = '';//vaciar el input
        }
    });
});
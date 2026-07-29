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


    const textarea = document.getElementById('chatbotInput');
    const alturaMaximaTextarea = 120;
    //el evento input se dispara cada que el usuario teclea una letra
    textarea.addEventListener('input', function () {
        //resetear la altura a automático temporalmente y apagar el scroll
        this.style.height = 'auto';//para que se vaya adaptando
        //this.style.overflowY = 'hidden';
        this.style.height = (this.scrollHeight) + 'px';
        //medir cuánto espacio ocupa, actualmente
        // const alturaNecesario = this.scrollHeight;

        if (this.scrollHeight > parseInt(getComputedStyle(this).maxHeight)) {
            //     //si supera los 120px, se enciende el scroll
            this.style.height = getComputedStyle(this).maxHeight;
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
            //     //si no se ha superado, crece con naturalidad. se suman los 2px de los bordes que border box contempla
            //     this.style.height = (alturaNecesario + 2) + 'px';
        }
        // /*se checa cuánto espacio necesita el espacio y se le da, 
        // respetando el maxwidth definido en css*/
        // this.style.height = this.scrollHeight+'px';
    })
    //simulación de envío de mensajes y vaciado del input
    form.addEventListener("submit", (e) => {
        e.preventDefault();//no se recarga la página

        if (input.value.trim() !== "") {

            //autocrecimiento del textarea


            //lógica del fetch para unirlo con el back

            console.log("mensaje enviado: ", input.value);

            input.value = '';//vaciar el input
        }
    });
});
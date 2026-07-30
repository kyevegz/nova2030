/* los parámetros que se le pasan son de tipo texto, donde el 
primero corresponde al mensaje a mostrar y, el segundo, el emisor, 
quién lo envió, si el user o ai (inteligencia artificial) */



function agregarMensajeAlChat(texto, emisor){
    //obtener la hora actual en formato HH:MM
    const horaActual = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    //configurar los nombres y las clases dependiendo de quién está hablando
    const esIA = emisor === 'ai';
    const claseMensaje = esIA ? 'chatbot__message--ai' : 'chatbot__message--user';
    const nombre = esIA ? 'MarIA' : 'Tú';

    //construcicción de la estructura HTML con Template Literals (ES6+)

    const burbujaHtml = `
        <div class="chatbot__message ${claseMensaje}">
            <div class="chatbot__message-container">
                <div class="chatbot__message-top">
                    ${esIA ? '<i class="fa-solid fa-user chatbot__message-avatar"></i>' : ''}
                    
                    
                    <span class="chat__message-name">${nombre}</span>
                    ${!esIA ? '<i class="fa-solid fa-user chatbot__message-avatar"></i>' : ''}
                    
                </div>
                
                <div class="chatbot__bubble">
                    <p>${texto}</p>
                    
                </div>
                <div class="chatbot__message-bottom">
                    <span class="chatbot__time">${horaActual}</span>
                </div>
            </div>
        </div>
    `;
        const chatbotContenedorMensajes = document.getElementById('chatbotMensajes')

    //inyectar el html al final del contenedor de mensajes
    chatbotContenedorMensajes.insertAdjacentHTML('beforeend', burbujaHtml);

    //autoscroll para que bajé hasta el último mensaje
    chatbotContenedorMensajes.scrollTop = chatbotContenedorMensajes.scrollHeight;
}


document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbotBtn');
    const ventanaChat = document.getElementById('chatbotVentana');
    const btnCerrar = document.getElementById('chatbotCerrar');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const chatbotContenedorMensajes = document.getElementById('chatbotMensajes')

    //abrir y cerrar

    trigger.addEventListener('click', () => {
        ventanaChat.classList.toggle('chatbot--hidden');
    });
    btnCerrar.addEventListener('click', () => {
        ventanaChat.classList.add('chatbot--hidden');
    });


    //const input = document.getElementById('chatbotInput');
    const alturaMaximaTextoUsuario = 120;
    //el evento input se dispara cada que el usuario teclea una letra
    input.addEventListener('input', function () {
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
    });
   
    //simulación de envío de mensajes y vaciado del input
    form.addEventListener("submit", async(e) => {
        e.preventDefault();//no se recarga la página

         //extraer y limpiar los espacios vacíos al inicio y al final
        const textoUsuario = input.value.trim();

        if (!textoUsuario) return;

        //capturación de elementos a bloquear
        const btEnviar = form.querySelector('.chatbot__send-btn');
        const indicadorTyping = document.getElementById('typingIndicator');



        //el mensaje del usuario se muestra de inmediato
        agregarMensajeAlChat(textoUsuario, 'user');


        //se limpiar el input y se resetea la altura
        input.style.height = 'auto';
        input.value = '';//vaciar el input

        //bloqueo de input y botóm
        input.disabled = true;
        btEnviar.disabled = true;
        indicadorTyping.classList.remove('chatbot--hidden');

        //scroll manual para que el usuario vea los 3 puntos
        chatbotContenedorMensajes.scrollTop = chatbotContenedorMensajes.scrollHeight;

        try{
            //ejecutar la llamada asíncrona al servidor
            const respuestaServidor = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    //se le indica a express que le hemos mandado un JSON
                    'Content-Type': 'application/json'
                },
                //ahora, el objeto se convierte a texto JSON
                body: JSON.stringify({mensaje:textoUsuario}) 
            });

            //verificar que el seervidor haya devolvido error o no
            if(!respuestaServidor.ok){
                throw new Error('Error en la respuesta del servidor');

                
            }
            //si sí devolvió, se convierte el JSON a un objeto de JS
            const respuestaIA = await respuestaServidor.json();
            //apagar los 3 puntitos antes de insertar la respuesta final
            indicadorTyping.classList.add('chatbot--hidden');
            
            //se dibuja la repsuesya de la ia
            agregarMensajeAlChat(respuestaIA.mensaje, 'ai');
        }catch(error){
            console.error("error al comunicarse con la api: ", error);
            agregarMensajeAlChat("Lo siento, tuve un problema de conexión. ¿Puedes reenvíar tu pregunta?", 'ai');
        }finally{
            //liberación, se va a ejecutar siempre, haya éxito o no
            input.disabled = false;
            btEnviar.disabled = false;
            input.focus();//se le devuelve el cursor para que el usuario siga escirbiendo
        }


            //lógica del fetch para unirlo con el back

            console.log("mensaje enviado: ", textoUsuario);
            
        
    });
});
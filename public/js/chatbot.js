document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('chatbotBtn');
    const ventanaChat = document.getElementById('chatbotVentana');
    const btnCerrar = document.getElementById('chatbotCerrar');

    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');

    const chatbotContenedorMensajes = document.getElementById('chatbotMensajes')
    const btEnviar = form.querySelector('.chatbot__send-btn');

    //indicador de las bolitas
    let indicadorTyping = null;

    /*DIVIDIR TODO POR FUNCIONES PARA MAYOR ESCALABILIDAD */

    //scrollear
    function scrollAlFinal() {
        chatbotContenedorMensajes.scrollTop = chatbotContenedorMensajes.scrollHeight;
    }

    function bloquearForm() {
        input.disabled = true;
        btEnviar.disabled = true;
    }

    function desbloquearForm() {
        input.disabled = false;
        btEnviar.disabled = false;
        input.focus();
    }

    function limpiarInput() {
        input.value = '';
        input.style.height = '41.6px';
        input.style.height = 'auto';
        
        input.style.overflowY = 'hidden';
    }

    function agregarMensajeAlChat(texto, emisor) {
        //obtener la hora actual en formato HH:MM
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        //configurar los nombres y las clases dependiendo de quién está hablando
        const esIA = emisor === 'ai';
        const claseMensaje = esIA ? 'chatbot__message--ai' : 'chatbot__message--user';
        const nombre = esIA ? 'MarIA' : 'Tú';

        //construcicción de la estructura HTML con Template Literals (ES6+)
        let contenido = texto;
        if(esIA){
            contenido = DOMPurify.sanitize(marked.parse(texto));
            const temp = document.createElement('div');
            temp.innerHTML = contenido;

            temp.querySelectorAll('table').forEach(tabla => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('chatbot__table-wrapper');

                tabla.parentNode.insertBefore(wrapper, tabla);
                wrapper.appendChild(tabla);
            });
            contenido = temp.innerHTML;
        }else{
            contenido = '<p>' + contenido + '</p>';
        }
        const burbujaHtml = `
        <div class="chatbot__message ${claseMensaje}">
            <div class="chatbot__message-container">
                <div class="chatbot__message-top">
                    ${esIA ? '<i class="fa-solid fa-user chatbot__message-avatar"></i>' : ''}             
                    <span class="chat__message-name">${nombre}</span>
                    ${!esIA ? '<i class="fa-solid fa-user chatbot__message-avatar"></i>' : ''}
                </div>
                <div class="chatbot__bubble">
                    <div class="chatbot__markdown">
                        ${contenido}
                    </div>
                </div>
                <div class="chatbot__message-bottom">
                    <span class="chatbot__time">${horaActual}</span>
                </div>
            </div>
        </div>
    `;


        //inyectar el html al final del contenedor de mensajes
        chatbotContenedorMensajes.insertAdjacentHTML('beforeend', burbujaHtml);

        //autoscroll para que bajé hasta el último mensaje
        scrollAlFinal();
    }

    function mostrarEscribiendo(){
        indicadorTyping =  document.createElement("div");
        indicadorTyping.className = "chatbot__message chatbot__message--ai";
        indicadorTyping.innerHTML = `
            <div class="chatbot__message-container">
                <div class="chatbot__bubble chatbot__bubble--typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatbotContenedorMensajes.appendChild(indicadorTyping);
        scrollAlFinal();
    }

    function ocultarEscribiendo(){
        if(indicadorTyping){
            indicadorTyping.remove();
            indicadorTyping = null;
        }
    }

    async function enviarMensajeIA(textoUsuario){
        const respuestaServidor = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                //se le indica a express que le hemos mandado un JSON
                'Content-Type': 'application/json'
            },
            //ahora, el objeto se convierte a texto JSON
            body: JSON.stringify({ mensaje: textoUsuario })
        });

        if (!respuestaServidor.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        return await respuestaServidor.json();
    }

    //abrir y cerrar

    trigger.addEventListener('click', () => {
        ventanaChat.classList.toggle('chatbot--hidden');
    });
    btnCerrar.addEventListener('click', () => {
        ventanaChat.classList.add('chatbot--hidden');
    });


    //const input = document.getElementById('chatbotInput');
    //el evento input se dispara cada que el usuario teclea una letra4

    input.addEventListener('input', function () {
        //resetear la altura a automático temporalmente y apagar el scroll
        this.style.height = 'auto';//para que se vaya adaptando
        //this.style.overflowY = 'hidden';
        this.style.height = (this.scrollHeight) + 'px';
        //medir cuánto espacio ocupa, actualmente
        // const alturaNecesario = this.scrollHeight;

        const alturaMaxima = parseInt(getComputedStyle(this).maxHeight);

        if (this.scrollHeight > alturaMaxima) {
            //     //si supera los 120px, se enciende el scroll
            this.style.height = alturaMaxima + 'px';
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });

    //simulación de envío de mensajes y vaciado del input
    form.addEventListener("submit", async (e) => {
        e.preventDefault();//no se recarga la página

        //extraer y limpiar los espacios vacíos al inicio y al final
        const textoUsuario = input.value.trim();

        if (!textoUsuario) return;

        agregarMensajeAlChat(textoUsuario, 'user');
        limpiarInput();
        bloquearForm();
        mostrarEscribiendo();

        try {
            //ejecutar la llamada asíncrona al servidor
            

            //verificar que el seervidor haya devolvido error o no
            
            //si sí devolvió, se convierte el JSON a un objeto de JS
            const respuestaIA = await enviarMensajeIA(textoUsuario);
            //apagar los 3 puntitos antes de insertar la respuesta final
            ocultarEscribiendo();

            //se dibuja la repsuesya de la ia
            

            agregarMensajeAlChat(respuestaIA.mensaje, 'ai');

        } catch (error) {
            console.error("error al comunicarse con la api: ", error);
            ocultarEscribiendo();
            agregarMensajeAlChat("Lo siento, tuve un problema de conexión. ¿Puedes reenvíar tu pregunta?", 'ai');
        } finally {
            desbloquearForm();
        }
    });
});
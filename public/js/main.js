document.addEventListener("DOMContentLoaded", () =>{
    const hamburgerBtn = document.querySelector(".nav-mini__hamburguer-button");//selecciona el botón del menú
    const sidebarMenu = document.querySelector(".sidebar--menu");//selecciona todo el sidebar
    // const iconBars = hamburgerBtn.querySelector(".nav-mini__icon--bars");//selecciona la etiqueta i del ícono de barras
    // const iconXmark = hamburgerBtn.querySelector(".nav-mini__icon--xmark");//selecciona la x

    if(hamburgerBtn && sidebarMenu){
        hamburgerBtn.addEventListener("click", (e) =>{
            e.preventDefault();

            //alterna la clase del menú, es decir, la clase de activado o desactivado
            const isOpen = sidebarMenu.classList.toggle("sidebar--active");
            hamburgerBtn.classList.toggle("nav-mini__hamburguer-button--active", isOpen);
            
            //se cambia el ícono y el aria-label según el estado
            if(isOpen){//cuando se abre el menú
                // iconBars.style.display = "none";//oculta las 3 barritas
                // iconBars.setAttribute("aria-hidden", "true"); //oculta del lector de pantalla
                
                // iconXmark.style.display = "block"; //muestra la tacha
                // iconXmark.removeAttribute("aria-hidden");//lo hace visible para lectores

                hamburgerBtn.setAttribute("aria-label", "Cerrar menú de navegación");//cambia el valor del aria label
            }else{//cuando está cerrado
                // iconXmark.style.display = "none";//quita la tacha
                // iconXmark.setAttribute("aria-hidden", "true");//regresa las barritas de hamburguesa
                
                // iconBars.style.display = "block"; //muestra las barras
                // iconBars.removeAttribute("aria-hidden");//lo hace visible para lectores
                
                hamburgerBtn.setAttribute("aria-label", "Abrir menú de navegación");//regresa el valor que tenía
            }
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {

    /*------------------------------------------
            MENÚ HAMBURGUESA -BOTÓN ABRIR
    -------------------------------------------*/
    const hamburgerBtn = document.querySelector(".nav-mini__hamburguer-button");//selecciona el botón del menú
    const sidebarMenu = document.querySelector(".sidebar--menu");//selecciona todo el sidebar

    if (hamburgerBtn && sidebarMenu) {//se ejecuta solo si ambos elementos existen en el DOM
        hamburgerBtn.addEventListener("click", (e) => {
            e.preventDefault();

            //alterna la clase del menú, es decir, la clase de activado o desactivado
            const isOpen = sidebarMenu.classList.toggle("sidebar--active");
            hamburgerBtn.classList.toggle("nav-mini__hamburguer-button--active", isOpen);

            //se cambia el ícono y el aria-label según el estado
            if (isOpen) {//cuando se abre el menú
                hamburgerBtn.setAttribute("aria-label", "Cerrar menú de navegación");//cambia el valor del aria label
            } else {//cuando está cerrado
                hamburgerBtn.setAttribute("aria-label", "Abrir menú de navegación");//regresa el valor que tenía
            }
        });
    }
});



document.addEventListener('DOMContentLoaded', () =>{


  //crear carrusel
  const principal =  new Splide('#splideUnidimensional', {
    type: 'loop',
    perPage: 1,
    gap: '2rem',
    focus: 0,
  });
  const originalSlides = Array.from(
    document.querySelectorAll(
      '#splideUnidimensional .splide__slide'
    )
  );
  console.log(originalSlides.length);

  principal.mount();

  //referencias a los elementos donde se inyectarán dinámicamente las convocatorias
  //const gridContainer = id => document.getElementById('callGrid');
  const container = document.getElementById('callGrid');

  //rederización de las 4 miniaturas en el grid
  function actualizarGrid(indexActivo){
    container.innerHTML = '';//limpiar por si acaso
    const total = originalSlides.length;
console.log(
    originalSlides.map(slide =>
        slide.querySelector('.splide-call-card__title').textContent
    )
);
    for(let i = 0; i < 4; i++){
      const indice = (indexActivo + i + 1) % total;
      const slide = originalSlides[indice];
      const imgSrc = slide.querySelector('.splide-call-card__image').src;
      const titleText = slide.querySelector('.splide-call-card__title').textContent;
      const cardMini = document.createElement('div');
      cardMini.className = 'call-grid-card';
      cardMini.dataset.index = indice;

      cardMini.innerHTML = `
        <img class = "call-grid-card__image" src = "${imgSrc}" alt = "${titleText}">
        <div class = "call-grid-card__content">
          <h4 class = "call-grid-card__title">${titleText}</h4>
        </div>
      `;
      container.appendChild(cardMini);
    }
  
  }

  //sincronización para actualizar el grid cada que el carrusel se mueva

  function obtenerIndiceActual(){
    const activa = document.querySelector(
      '#splideUnidimensional .splide__slide.is-active.is-visible:not(.splide__slide--clone)'
    );

    return Number(activa.dataset.index);
  }
  principal.on('moved', () => {
    console.log(
        'Activo:',
        obtenerIndiceActual()
    );
    actualizarGrid(obtenerIndiceActual());
  });

  //pone el grid en cuanto cargue la página
  actualizarGrid(obtenerIndiceActual());

  //delegar eventos para que cuando se dé clic en el grid, se mueva el carrusel principal
  container.addEventListener('click', (event) => {
    
    const miniatura = event.target.closest('.call-grid-card');
    if(!miniatura) return;

    const targetIndex = Number(miniatura.dataset.index);
    
    console.log(
        'Click en:',
        targetIndex,
        originalSlides[targetIndex]
            .querySelector('.splide-call-card__title')
            .textContent
    );
    principal.go(targetIndex);
  });
});
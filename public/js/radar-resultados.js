document.addEventListener('DOMContentLoaded', () => {
    //el canvas donde se va a dibujar el chart
    const contexto = document.getElementById('radarChart');
    if(!contexto) return;

    /*el puntajes radar, lo que se recibe desde 
    node, se inyecta con ejs en el html*/

    //extra el json del canvas
    const datosCrudos = contexto.dataset.puntajes;
    //se convierte de texto a un objeto js
    const puntajesRadar = JSON.parse(datosCrudos);

    const labels = Object.keys(puntajesRadar);
    const dataValues = Object.values(puntajesRadar);

    new Chart( contexto, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tus puntajes destacados',
                data: dataValues,

                //estilos
                backgroundColor: 'rgba(16, 168, 154, 0.2)',
                borderColor: '#10bc9a',

                pointBackgroundColor: '#099078',
                pointBorderColor:'#115749',

                hoverBackgroundColor: 'rgba(16, 188, 154, 0.5)',
                hoverBorderColor: '#10bc9a',

                pointHoverBackgroundColor:'#099078',
                pointHoverBorderColor: '#099078',
                borderWidth: 2,
            }]
        },
        options: {
            devicePixelRatio: 3,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {color: 'rgba(0,0,0,0.1)'},
                    grid: {color: 'rgab(0,0,0,0.1)'},
                    pointLabels: {
                        font: {
                            family: '"Nunito", sans-serif',
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#4a5363'
                    },
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {display: false}, //oculta la leyende superior
                tooltip: {
                    backgroundColor: '#15181e',
                    titleFont: {family: '"Nunito", sans-serif', size: 14},
                    bodyFont: {family: '"Nunito", sans-serif', size: 14},
                    padding: 12,
                    cornerRadius: 8
                }
            }
        }
    });
});
console.log('funciona script.js')
// guardarTabla();
document.addEventListener("mouseup", acciones, false);

function Registro(fecha, tipo, fondo, cuotapartes, valor_cp, tenencia, resultado) {
    this.fecha = fecha;
    this.tipo = tipo;
    this.fondo = fondo;
    this.cuotapartes = cuotapartes;
    this.valor_cp = valor_cp;
    this.tenencia = tenencia;
    this.resultado = resultado;
}

async function tablaDia() {
    let tablaHTML = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
    let registro = [];
    let hoy = await diaF(moment(new Date));
    if (tablaHTML) {
        for (i = 0; i < tablaHTML.childElementCount - 1; i++) {
            registro[i] = new Registro(
                hoy,
                tablaHTML.children[i].children[0].textContent,
                tablaHTML.children[i].children[1].textContent,
                parseFloat(tablaHTML.children[i].children[2].textContent.replace(/(\.)/, "").replace(/(\,)/, ".")),
                parseFloat(tablaHTML.children[i].children[3].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\$/, "")),
                parseFloat(tablaHTML.children[i].children[4].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\$/, "")),
                parseFloat(tablaHTML.children[i].children[5].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\$/, "")),
            )
        }
    }
    return registro
}

let cargado = false;

async function acciones(e) {
    if (!cargado && e.which == 1 && window.location.href.includes('fondos-de-inversion')) {
        e.preventDefault();
        let tablaD = await tablaDia();
        guardarTabla(tablaD);
        mostrarRendimientoFondo();
        mostrarPorcentajeVariacion(variacionResultado(tablaD));
        injectChart();
        const dia = await diaF(moment(new Date));
        console.log(dia.format("DD-MM-YYYY"));
        cargado = false;
    }
}

async function mostrarRendimientoFondo() {
    const tablaD = await tablaDia();
    const dia = await diaF(moment(new Date));
    const tablaHTML = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
    const ultimaCol = document.querySelector("table > thead > tr > th.head-right.last");
    if (ultimaCol) {
        ultimaCol.style.textAlign = "left"
        ultimaCol.textContent = `Resultado Diario (%) ${dia.format("DD-MM-YYYY")}`;
    }
    // const botones = document.querySelectorAll("obp-boton > button");
    if (tablaHTML) {

        for (i = 1; i < tablaHTML.childElementCount; i++) {
            let fondo = document.querySelector(`table > tbody > tr:nth-child(${i}) > td:nth-child(2)`).innerText;
            let totalFondoElm = document.querySelector(`table > tbody > tr:nth-child(${i}) > td:nth-child(7)`);
            let btn = document.querySelector(`table > tbody > tr:nth-child(${i}) > td.action.body-right > obp-boton`);
            let { abs, rel } = variacionResultado(tablaD, fondo);
            let a = abs.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            let r = rel.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            const prevVal = document.querySelector(`#val${i}`);
            if (prevVal)
                prevVal.remove()
            const val = document.createElement("a");
            val.id = `val${i}`;
            if (abs >= 0) {
                // totalFondoElm.innerText = `+${rel.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                totalFondoElm.insertBefore(val, btn);
                val.innerText = `+${a} (+${r}%)`;
                val.style.color = "limegreen"
                val.style.padding = '10px';
            } else {
                // totalFondoElm.innerText = `${rel.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                totalFondoElm.insertBefore(val, btn);
                val.innerText = `${a} (${r}%)`;
                val.style.color = "red"
                val.style.padding = '10px';
            };
            totalFondoElm.style.textAlign = "left"
        }
    }
}

function resultadoTotal(array, fondo = undefined) {
    if (fondo)
        array = array.filter(el => el.fondo == fondo);
    return array.reduce((acumulador, { tenencia }) => acumulador + tenencia, 0);
}

function variacionResultado(tablaD, fondo = undefined) {
    // const tablaD = await tablaDia();
    const resultadoHoy = resultadoTotal(tablaD, fondo);
    const tabla = leerLocalStorage();
    const hoy = tablaD[0].fecha;
    const fechasAnteriores = tabla.map(el => el.fecha).filter(el => el.isBefore(hoy));
    const diaAnterior = moment.max(fechasAnteriores);
    const datosAnteriores = tabla.filter(el => el.fecha.isSame(diaAnterior));
    const resultadoAnterior = resultadoTotal(datosAnteriores, fondo);

    return {
        abs: (resultadoHoy - resultadoAnterior),
        rel: (resultadoHoy - resultadoAnterior) / resultadoAnterior * 100,
    };
}

function mostrarPorcentajeVariacion(variacion) {
    const total = document.querySelector("table > tbody > tr.totales > th:nth-child(7)");
    const abs = variacion.abs.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const rel = variacion.rel.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (total) {
        if (variacion.abs >= 0) {
            total.innerText = `+${abs} (+${rel}%)`
            total.style.color = "limegreen"
        } else {
            total.innerText = `${abs} (${rel}%)`
            total.style.color = "red"
        };

        total.style.textAlign = "left"
        // total.style.fontSize = "16px"
    }
}

function leerLocalStorage() {
    let data = JSON.parse(localStorage.getItem('data'));
    if (data) {
        for (var i = 0; i < data.length; i++) {
            data[i].fecha = moment(data[i].fecha);
        }
    }
    return data
}

function guardarTabla(tabla) {
    const data = leerLocalStorage();
    const dataFiltro = data.filter(el => !(moment(el.fecha).isSame(moment(tabla[0].fecha))));
    if (tabla)
        tabla.forEach(el => dataFiltro.unshift(el));
    localStorage.setItem('data', JSON.stringify(dataFiltro));
    console.log('Se guardaron los datos en la memoria.');
}

//ya no se usa, la funcion diaF contempla los feriados
function dia(date) {
    //date debe ser de tipo moment
    if (date.hour() < 8) {
        date.subtract(1, 'day')
    }
    if (date.day() == 0) {
        date.add(1, 'day');
    } else if (date.day() == 6) {
        date.add(2, 'day');
    }
    return moment([date.year(), date.month(), date.date(), 0, 0, 0, 0])
}

//funcion diaF contempla días feriados
async function diaF(date) {
    //date debe ser de tipo moment
    let fecha = date.format("YYYY-MM-DD");
    if (date.hour() < 8) {
        date.subtract(1, 'day');
    }
    if (date.day() == 6) {
        // console.log('es sabado');
        date.add(2, 'day');
    } else if (date.day() == 0) {
        // console.log('es domingo');
        date.add(1, 'day');
    }
    let esDiaFeriado = await isFeriado(moment([date.year(), date.month(), date.date(), 0, 0, 0, 0])._d);
    if (esDiaFeriado) {
        console.log('es feriado');
        return diaF(moment([date.year(), date.month(), date.date(), 8, 0, 0, 0]).add(1, 'day'));

    } else {
        fecha = date.format("YYYY-MM-DD");
        // console.log(fecha);
        return moment([date.year(), date.month(), date.date(), 8, 0, 0, 0])
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    console.log('dentro del ready');
    var descargar = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer");
    var btn = document.createElement("a");
    descargar.appendChild(btn);
    btn.id = "btnExt";
    btn.innerText = "Guardar";
});

function traer(year = 2020) {
    fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
        .then(data => data.json())
        .then(res => res.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0])))
        .then(res => console.log(res))
        .catch(err => console.error(err));
}

function esFeriado(fecha) {
    let dia = moment(fecha);
    let year = fecha.getFullYear();
    return fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
        .then(data => data.json())
        .then(res => res.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0])))
        .then(res => (res.filter(el => el.isSame(dia)).length))
        // .then(res => console.log(res))
        .catch(err => console.error(err));
}

async function isFeriado(fecha) {
    let dia = moment(fecha);
    let year = fecha.getFullYear();
    let feriados = await fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
    let feriadosJson = await feriados.json();
    let feriadosMoment = feriadosJson.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0]));
    let filtrado = feriadosMoment.filter(el => el.isSame(dia));
    return filtrado.length
}

function getData() {
    const data = localStorage.getItem('data')
    const datos = JSON.parse(data).reverse()
    let array = {}
    const etiquetas = [...new Set(datos.map(item => item.fondo))]
    const fechas = datos.reduce((acc, { fecha, fondo, resultado }) => {
        (acc[fecha] || (acc[fecha] = [])).push({ fondo, resultado })
        return acc
    }, {})

    array.days = Object.keys(fechas)
    array.labels = (etiquetas)
    array.values = []
    etiquetas.forEach((label) => {
        let valores = []
        Object.keys(fechas).forEach(el => {
            let valor = fechas[el].filter(elem => elem.fondo === label)[0]
            if (valor) {
                valor = valor.resultado
            } else {
                valor = null
            }
            valores.push(valor)
        })
        array.values.push(valores)
    })
    console.log({ array });

    const { days, labels, values } = array
    return { days, labels, values };
}

function injectChart() {
    const footer = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer")
    footer.style.height = "650px"
    let prevChart = document.querySelector('div.chart-container2');
    const div = document.createElement("div");
    const boton1 = document.createElement("button");
    const boton2 = document.createElement("button");
    const boton3 = document.createElement("button");
    const boton4 = document.createElement("button");
    div.classList.add('chart-container2');
    boton1.textContent = '7d';
    boton1.classList.add('toggleScale');
    boton1.id = '7d';
    boton1.style.margin = "5px";
    boton2.textContent = '30d';
    boton2.classList.add('toggleScale');
    boton2.id = '30d';
    boton2.style.margin = "5px";
    boton3.textContent = '90d';
    boton3.classList.add('toggleScale');
    boton3.id = '90d';
    boton3.style.margin = "5px";
    boton4.textContent = 'Reset';
    boton4.classList.add('toggleScale');
    boton4.id = 'reset';
    boton4.style.margin = "5px";
    // div.style.backgroundColor = 'white'
    div.innerHTML = `<canvas id="myChart" aria-label="Hello ARIA World" role="img"></canvas>`;
    // if (prevChart) footer.removeChild(prevChart);
    if (!prevChart) {
        footer.appendChild(boton1)
        footer.appendChild(boton2)
        footer.appendChild(boton3)
        footer.appendChild(boton4)
        footer.appendChild(div)
    } else {
        return
    }
    setup();
}

async function setup() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const data = getData();
    const borderWidth = 1;
    console.log(data);
    let type = 'Todo';

    let config = {
        type: 'line',
        data: {
            labels: data.days,
            // labels: data.days1,
            datasets:
                [
                    {
                        label: data.labels[0],
                        data: data.values[0],
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true
                    },
                    {
                        label: data.labels[1],
                        data: data.values[1],
                        fill: false,
                        borderColor: 'rgba(99, 200, 132, 1)',
                        backgroundColor: 'rgba(99, 200, 132, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true
                    },
                    {
                        label: data.labels[2],
                        data: data.values[2],
                        fill: false,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true
                    },
                    {
                        label: data.labels[3],
                        data: data.values[3],
                        fill: false,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true
                    }
                ]
        },
        options: {
            title: {
                display: true,
                text: 'Fondos Comunes de Inversión - ' + type
            },
            // parsing: {
            //     xAxisKey: 'cuotapartes',
            //     yAxisKey: 'resultado'
            // },
            tooltips: {
                mode: 'x',
                intersect: false,
                titleFontSize: 18,
                bodyFontSize: 14,
                callbacks: {
                    title: tooltipItem => moment(tooltipItem[0].label).format('DD MMM YYYY'),
                    label: tooltipItem => tooltipItem.yLabel.toLocaleString('de-DE', { minimumFractionDigits: 2 })
                },
                bodyAlign: 'right',
                position: 'average'
            },
            elements: {
                line: {
                    tension: 0
                },
                point: {
                    intersect: false,
                    mode: 'dataset',
                    // hoverRadius: 6,
                    hitRadius: 1
                }
            },
            legend: {
                display: true,
                position: 'bottom'
            },
            hover: {
                mode: 'x',
                intersect: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: value => `$ ${value.toLocaleString('de-DE')}`
                    }
                }],
                xAxes: [{
                    ticks: {
                        // min: moment(await diaF(moment(new Date()))).subtract(40, 'days')
                    },
                    type: 'time',
                    time: {
                        unit: 'month'
                    }
                }]
            }
        }
    };

    const myChart = new Chart(ctx, config);

    document.querySelectorAll('.toggleScale').forEach(elm => {
        elm.addEventListener('click', function (e) {
            console.log(e.target);
            switch (e.target.id) {
                case '7d':
                    myChart.options.scales.xAxes[0].ticks.min = moment(new Date()).subtract(7, 'days');
                    type = 'Filtrado'
                    // code block
                    break;
                case '30d':
                    myChart.options.scales.xAxes[0].ticks.min = moment(new Date()).subtract(30, 'days');
                    type = 'Filtrado'
                    // code block
                    break;
                case '90d':
                    myChart.options.scales.xAxes[0].ticks.min = moment(new Date()).subtract(90, 'days');
                    type = 'Filtrado'
                    // code block
                    break;
                case 'reset':
                    delete myChart.options.scales.xAxes[0].ticks.min;
                    type = 'Todo'
                    // code block
                    break;
                default:
                // code block
            }

            console.log('presionaste botón');
            // if (type === 'Todo') {
            //     type = 'Filtrado'
            // } else {
            //     type = 'Todo'
            // };
            myChart.options.title.text = 'Fondos Comunes de Inversión - ' + type;

            myChart.update();
        });
    });
}
console.log('funciona script.js')
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
        cargado = true;
        window.scroll({
            top: 1000,
            behavior: 'smooth'
        });
    } else if (e.which == 1 && !window.location.href.includes('fondos-de-inversion')) {
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
                prevVal.remove();
            const val = document.createElement("a");
            val.id = `val${i}`;
            if (abs >= 0) {
                totalFondoElm.insertBefore(val, btn);
                val.innerText = `+${a} (+${r}%)`;
                val.style.color = "limegreen";
                val.style.padding = '10px';
            } else {
                totalFondoElm.insertBefore(val, btn);
                val.innerText = `${a} (${r}%)`;
                val.style.color = "red";
                val.style.padding = '10px';
            };
            totalFondoElm.style.textAlign = "left";
        }
    }
}

function resultadoTotal(array, fondo = undefined) {
    if (fondo)
        array = array.filter(el => el.fondo == fondo);
    return array.reduce((acumulador, { tenencia }) => acumulador + tenencia, 0);
}

function variacionResultado(tablaD, fondo = undefined) {
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
    data ? data.forEach(el => el.fecha = moment(el.fecha)) : data
    return data
}

function guardarTabla(tabla) {
    const data = leerLocalStorage();
    const dataFiltro = data.filter(el => !(moment(el.fecha).isSame(moment(tabla[0].fecha))));
    if (tabla) {
        tabla.forEach(el => dataFiltro.unshift(el));
        localStorage.setItem('data', JSON.stringify(dataFiltro));
        console.log('Se guardaron los datos en la memoria.');
    }
}

//funcion diaF contempla días feriados
async function diaF(date) {
    //date debe ser de tipo moment
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
    let esDiaFeriado = await isHoliday(moment([date.year(), date.month(), date.date(), 0, 0, 0, 0])._d);
    if (esDiaFeriado) {
        console.log('es feriado');
        return diaF(moment([date.year(), date.month(), date.date(), 8, 0, 0, 0]).add(1, 'day'));
    } else {
        return moment([date.year(), date.month(), date.date(), 0, 0, 0, 0])
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

async function isHoliday(fecha) {
    const dia = moment(fecha);
    const year = fecha.getFullYear();
    const feriados = await fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
    const feriadosJson = await feriados.json();
    const feriadosMoment = feriadosJson.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0]));
    const filtrado = feriadosMoment.filter(el => el.isSame(dia));
    return filtrado.length
}

function getData(from, to, data) {
    data = data || JSON.parse(localStorage.getItem('data'));
    to = to || data[0].fecha;
    const datos = from ? data.reverse().filter(el => moment(el.fecha).isBetween(moment(from), moment(to), undefined, '[]')) : data.reverse();
    let array = {}
    const fondos = [...new Set(datos.map(item => item.fondo))]
    const fechas = datos.reduce((acc, { fecha, fondo, valor_cp, tenencia }) => {
        (acc[fecha] || (acc[fecha] = [])).push({ fondo, valor_cp, tenencia })
        return acc
    }, {})
    array.days = Object.keys(fechas)
    array.labels = fondos.sort()
    array.values = []
    array.holdings = []
    fondos.forEach(fondo => {
        let valores = []
        let tenencias = []
        Object.keys(fechas).forEach(fecha => {
            let valorDia = fechas[fecha].filter(elem => elem.fondo === fondo)[0]
            let valor, tenencia
            if (valorDia) {
                valor = valorDia.valor_cp
                tenencia = valorDia.tenencia
            } else {
                valor = null;
                tenencia = null
            }

            valores.push(valor)
            tenencias.push(tenencia)
        })
        array.values.push(valores)
        array.holdings.push(tenencias)
    })
    const { days, labels, values, holdings } = array
    return { days, labels, values, holdings };
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
    const boton5 = document.createElement("button");
    div.classList.add('chart-container2');
    boton1.id = '10d';
    boton2.id = '30d';
    boton3.id = '60d';
    boton4.id = 'reset';
    boton5.id = 'borrar';
    boton1.textContent = '10d';
    boton2.textContent = '30d';
    boton3.textContent = '60d';
    boton4.textContent = 'Reset';
    boton5.textContent = 'Borrar';
    boton1.style.margin = "5px";
    boton2.style.margin = "5px";
    boton3.style.margin = "5px";
    boton4.style.margin = "5px";
    boton5.style.margin = "5px";
    boton1.classList.add('toggleScale');
    boton2.classList.add('toggleScale');
    boton3.classList.add('toggleScale');
    boton4.classList.add('toggleScale');
    boton5.classList.add('toggleScale');
    div.innerHTML = `<canvas id="myChart" aria-label="Hello ARIA World" role="img"></canvas>`;
    if (!prevChart) {
        footer.appendChild(boton1)
        footer.appendChild(boton2)
        footer.appendChild(boton3)
        footer.appendChild(boton4)
        // footer.appendChild(boton5)
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
    const showLine = true;
    let type = 'Todo';
    let config = {
        data: {
            labels: data.days,
            datasets:
                [
                    {
                        type: 'line',
                        order: 0,
                        label: data.labels[0],
                        data: delta(data.values[0]),
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        order: 1,
                        label: data.labels[1],
                        data: delta(data.values[1]),
                        fill: false,
                        borderColor: 'rgba(99, 200, 132, 1)',
                        backgroundColor: 'rgba(99, 200, 132, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        order: 2,
                        label: data.labels[2],
                        data: delta(data.values[2]),
                        fill: false,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        order: 3,
                        label: data.labels[3],
                        data: delta(data.values[3]),
                        fill: false,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                        borderWidth: borderWidth,
                        spanGaps: true,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        // fill: '-1',
                        pointRadius: false,
                        showLine: showLine,
                        order: 4,
                        barPercentage: 1,
                        categoryPercentage: .9,
                        label: data.labels[0],
                        data: toNumbers(data.holdings[0]),
                        borderWidth: false,
                        borderColor: 'rgba(255, 99, 132, 0.0)',
                        backgroundColor: `rgba(255, 99, 132, 0.2)`,
                        spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        type: 'line',
                        fill: '-1',
                        pointRadius: false,
                        showLine: showLine,
                        order: 5,
                        barPercentage: 1,
                        categoryPercentage: .9,
                        label: data.labels[1],
                        data: toNumbers(data.holdings[1]),
                        borderWidth: false,
                        borderColor: 'rgba(99, 200, 132, 0.0)',
                        backgroundColor: `rgba(99, 200, 132, 0.2)`,
                        spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        type: 'line',
                        fill: '-1',
                        pointRadius: false,
                        showLine: showLine,
                        order: 6,
                        barPercentage: 1,
                        categoryPercentage: .9,
                        label: data.labels[2],
                        data: toNumbers(data.holdings[2]),
                        borderWidth: false,
                        borderColor: 'rgba(54, 162, 235, 0.0)',
                        backgroundColor: `rgba(54, 162, 235, 0.2)`,
                        spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        type: 'line',
                        fill: '-1',
                        pointRadius: false,
                        showLine: showLine,
                        order: 7,
                        barPercentage: 1,
                        categoryPercentage: .9,
                        label: data.labels[3],
                        data: toNumbers(data.holdings[3]),
                        borderWidth: false,
                        borderColor: 'rgba(153, 102, 255, 0.0)',
                        backgroundColor: `rgba(153, 102, 255, 0.2)`,
                        spanGaps: true,
                        yAxisID: 'y1',
                    }

                ]
        },
        options: {
            plugins: {
                filler: {
                    propagate: true
                }
            },
            title: {
                display: true,
                text: 'Fondos Comunes de Inversión - ' + type
            },
            // parsing: {
            //     xAxisKey: 'cuotapartes',
            //     yAxisKey: 'resultado'
            // },
            tooltips: {
                mode: 'x-axis',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                titleFontFamily: 'Open Sans',
                titleFontSize: 14,
                titleFontColor: 'rgba(0, 0, 0, 0.7)',
                titleFontStyle: 'bold',
                titleAlign: 'center',
                bodyFontFamily: 'Open Sans',
                // bodyFontSize: 14,
                bodyFontColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(122, 122, 122, 0.2)',
                bodySpacing: 3,
                borderWidth: 1,
                callbacks: {
                    title: tooltipItem => tooltipItem[0] ? moment(tooltipItem[0].label).format('DD MMM YYYY').replace('.', '') : '',
                    label: (tooltipItem, data) => {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += `${tooltipItem.yLabel.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
                        return label;
                    }
                },
                filter: function (tooltipItem) {
                    return tooltipItem.datasetIndex < 4;
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
                    mode: 'x-axis',
                    hoverRadius: 5,
                    hitRadius: 0,
                    borderWidth: 1,
                }
            },
            legend: {
                display: true,
                position: 'bottom',
                itemWidth: 350
            },
            hover: {
                mode: 'x-axis',
                intersect: true
            },
            scales: {
                yAxes: [{
                    id: 'y',
                    position: 'left',
                    ticks: {
                        callback: value => `${value.toLocaleString('de-DE')}%`
                    }
                },
                {
                    id: 'y1',
                    position: 'right',
                    stacked: true,
                    // offset: false,
                    gridLines: {
                        display: true,
                        drawOnChartArea: true,
                        drawTicks: true,
                        borderDash: [5, 5],
                        borderDashOffset: 0.1,
                        offsetGridLines: false
                    },
                    ticks: {
                        // max: 800000,
                        beginAtZero: true,
                        callback: value => `$ ${value.toLocaleString('de-DE')}`
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        offsetGridLines: false
                    },
                    offsetGridLines: false,
                    stacked: true,
                    ticks: {
                        callback: label => {
                            return label.replace('.', '');
                        },
                        minor: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                    },
                    type: 'time',
                    time: {
                        displayFormats: {
                            month: 'MMM YYYY'
                        },
                        unit: 'day'
                    }
                }]
            }
        }
    };

    const myChart = new Chart(ctx, config);

    document.querySelectorAll('.toggleScale').forEach(elm => {
        elm.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            let opcion;
            switch (e.target.id) {
                case '10d':
                    myChart.options.scales.xAxes[0].time.unit = 'day'
                    opcion = 9;
                    type = '10 días'
                    break;
                case '30d':
                    myChart.options.scales.xAxes[0].time.unit = 'day'
                    opcion = 29;
                    type = '30 días'
                    break;
                case '60d':
                    myChart.options.scales.xAxes[0].time.unit = 'day'
                    opcion = 59;
                    type = '60 días'
                    break;
                case 'reset':
                    type = 'Todo'
                    myChart.options.scales.xAxes[0].time.unit = 'month'
                    let data = getData();
                    opcion = moment(data.days[data.days.length - 1]).diff(moment(data.days[0]), 'days');
                    break;
                case 'borrar':
                    type = 'Borrado'
                    myChart.options.scales.xAxes[0].time.unit = 'day'
                    deleteDays(1, myChart);
                    myChart.update()
                    return
                    break;
                default:
            }
            const dif = moment(myChart.data.labels[0]).diff(moment(myChart.data.labels[myChart.data.labels.length - 1]).subtract(opcion, 'days'), 'days');
            if (dif < 0) {
                let days = myChart.data.labels.filter(dia => moment(dia).isSameOrBefore(moment(myChart.data.labels[myChart.data.labels.length - 1]).subtract(opcion, 'days'))).length;
                deleteDays(days, myChart);
            } else if (dif > 0) {
                let from = moment(myChart.data.labels[myChart.data.labels.length - 1]).subtract(opcion, 'days');
                addDays(from, myChart);
            };
            myChart.update({
                duration: 800,
                easing: 'easeOutBounce'
            });
        });
    });
}

function delta(arr) {
    let res = [];
    let acc = 0
    arr.forEach((cur, ind, vec) => {
        let vari = (cur - vec[ind - 1]) / vec[ind - 1] * 100 || 0
        acc = (acc || (vari != Infinity)) ? acc + vari : acc
        res.push(acc);
    })
    return res
}

function deleteDays(days, chart) {
    chart.data.labels.splice(0, days);
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y').forEach(dataset => {
        dataset.data.splice(0, days);
        dataset.data = dataset.data.map((point) => {
            return point - dataset.data[0];
        });
    });
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y1').forEach(dataset => dataset.data.splice(0, days));
};

function addDays(from, chart) {
    let to = moment(chart.data.labels[0]).subtract(1, 'days')._d;
    const data = getData(from, to);
    const dataPos = getData(to);
    data.days.reverse().forEach(dia => chart.data.labels.unshift(dia));
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y1').forEach((dataset, i) => {
        data.holdings[i].reverse().forEach(valor => dataset.data.unshift(valor));
    });
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y1').forEach(dataset => {
        dataset.data = toNumbers(dataset.data);
    })
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y').forEach((dataset, i) => {
        data.values[i].reverse().forEach(valor => {
            dataset.data.unshift(valor);
        });
        let k = 0;
        for (var j = data.days.length; j < dataset.data.length; j++) {
            dataset.data[j] = dataPos.values[i][k];
            k++
        }
        dataset.data = delta(dataset.data);
    });
};

const toNumbers = array => array.map(val => val ? val : 0)
const toMonth = array => array.map(day => moment(day).subtract(moment(day).date() - 1, 'days').toJSON())

const maxDates = () => {
    const data = leerLocalStorage()
    let fechas = [...new Set(data.map(el => el.fecha))]
    let fech = [...new Set(fechas.map(el => moment(el).subtract(moment(el).date() - 1, 'days').toJSON()))]
    let res = []
    fech.forEach(mes => {
        let filtrado = fechas.filter(fecha => moment(fecha).isBetween(moment(mes), moment(mes).add(1, 'months').subtract(1, 'days')), undefined, '[]').map(el => moment(el))
        res.push(moment.max(filtrado).toJSON())
    })
    return res
}

const filterDataMaxDates = () => {
    let datos = JSON.parse(localStorage.getItem('data'))
    let max = maxDates()
    return datos.filter(data => max.find(el => el == data.fecha) ? true : false)
}
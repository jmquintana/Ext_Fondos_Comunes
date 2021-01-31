console.log('funciona script.js')
document.addEventListener("mouseup", acciones, false);
let globalData = JSON.parse(localStorage.getItem('data'));

function Registro(fecha, tipo, fondo, cuotapartes, valor_cp, tenencia, resultado) {
    this.fecha = fecha;
    this.tipo = tipo;
    this.fondo = fondo;
    this.cuotapartes = cuotapartes;
    this.valor_cp = valor_cp;
    this.tenencia = tenencia;
    this.resultado = resultado;
    this.getProfit = () => {
        const filtro = globalData.filter(registro => registro.fondo === this.fondo);
        const index = filtro.findIndex(el => el.fecha.isSame(this.fecha));
        return (index < filtro.length - 1) ? Math.round(1000 * (this.valor_cp - filtro[index + 1].valor_cp) * filtro[index + 1].cuotapartes) / 1000 : 0;
    };
};

async function tablaDia() {
    let tablaHTML = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
    let registro = [];
    let hoy = await diaF(moment(new Date));
    let tipo = "";
    if (tablaHTML) {
        for (i = 0; i < tablaHTML.childElementCount - 1; i++) {
            tipo = tablaHTML.children[i].children[0].textContent === "" ? tipo : tablaHTML.children[i].children[0].textContent;
            registro[i] = new Registro(
                hoy,
                tipo,
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

function Fondo(fecha, tipo, fondo, valor_cp, lastDay, lastMonth, lastQuarter, lastYear) {
    this.fecha = fecha;
    this.tipo = tipo;
    this.fondo = fondo;
    this.valor_cp = valor_cp;
    this.lastDay = lastDay;
    this.lastMonth = lastMonth;
    this.lastQuarter = lastQuarter;
    this.lastYear = lastYear;
};

async function tablaFondos() {
    let tablaFondos = document.querySelector("table#info > tbody");
    let fondos = [];
    let hoy = await diaF(moment(new Date));
    if (tablaFondos) {
        let tipo = "";
        for (i = 0; i < tablaFondos.childElementCount - 1; i++) {
            tipo = tablaFondos.children[i].children[0].innerText.trim() === "" ? tipo : tablaFondos.children[i].children[0].innerText.trim();
            fondos[i] = new Fondo(
                hoy,
                tipo,
                tablaFondos.children[i].children[1].innerText.trim(),
                parseFloat(tablaFondos.children[i].children[2].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\$/, "")),
                parseFloat(tablaFondos.children[i].children[3].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\%/, "")),
                parseFloat(tablaFondos.children[i].children[4].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\%/, "")),
                parseFloat(tablaFondos.children[i].children[5].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\%/, "")),
                parseFloat(tablaFondos.children[i].children[6].textContent.replace(/(\.)/, "").replace(/(\,)/, ".").replace(/\%/, "")),
            )
        }
    }
    return fondos
}

async function acciones(e) {
    if (e.which == 1 && window.location.href.includes('fondos-de-inversion')) {
        e.preventDefault();
        // console.clear()
        moment.locale('es')
        const tabDia = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
        const tabFon = document.querySelector("table#info > tbody");
        if (!cargado && tabDia) {
            const tablaD = await tablaDia();
            chek(tablaD);
            guardarFondos(tablaD, 'data');
            mostrarRendimientoFondo();
            mostrarPorcentajeVariacion(variacionResultado(tablaD));
            tabDia ? injectChart() : "";
            cargado = true;
            window.scroll({
                top: 1000,
                behavior: 'smooth'
            });
        }
        setTimeout(handler, 4000)
    } else if (e.which == 1 && !window.location.href.includes('fondos-de-inversion')) {
        cargado = false;
    }
}

async function handler() {
    if (window.location.href.includes('fondos-de-inversion'))
        if (document.querySelectorAll('.md-nav-item')[1].ariaSelected === "true")
            if (document.querySelectorAll('md-radio-button')[0].classList.contains('md-checked')) {
                const tablaF = await tablaFondos();
                guardarFondos(tablaF, 'fondosARS');
                cargado = false
            } else if (document.querySelectorAll('md-radio-button')[1].classList.contains('md-checked')) {
                const tablaF = await tablaFondos();
                guardarFondos(tablaF, 'fondosUSD');
                cargado = false
            } else {
                return
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
    const tabla = leerLocalStorage('data');

    const resHoy = fondo ? tabla.filter(el => el.fondo == fondo)[0].tenencia : resultadoTotal(tabla.slice(0, 4));
    const anterior = fondo ? tabla.filter(el => el.fondo == fondo)[1].tenencia : resultadoTotal(tabla.slice(4, 8));

    // console.log('Fondo:', fondo)
    // console.log('Resultado hoy', resHoy)
    // console.log('Resultado anterior', anterior)

    // const resultadoHoy = resultadoTotal(tablaD, fondo);

    // const hoy = tablaD[0].fecha;
    // const fechasAnteriores = tabla.map(el => el.fecha).filter(el => el.isBefore(hoy, 'day'));
    // const diaAnterior = moment.max(fechasAnteriores);
    // const datosAnteriores = tabla.filter(el => el.fecha.isSame(diaAnterior));
    // const resultadoAnterior = resultadoTotal(datosAnteriores, fondo);
    return {
        abs: (resHoy - anterior),
        rel: (resHoy - anterior) / anterior * 100,
    };
}

async function chek(tablaD) {
    let table = []
    tablaD.forEach((el, i) => {
        let val = {};
        val.fondo = el.fondo.replace(/Sup[[a-zA-ZÀ-ÿ]+\s/, '')
        val.cuota = el.cuotapartes
        val.valor = el.valor_cp
        val.tenencia = Math.round(el.tenencia * 100) / 100
        val.calculo = Math.round(el.cuotapartes * el.valor_cp * 100) / 100
        val.dif = Math.round((val.tenencia - val.calculo) * 100) / 100
        val.ok = Math.abs(val.dif) <= 0.01 ? "✅" : "❌"
        table.push(val)
    })
    console.log(tablaD[0].fecha.format('DD/MM/YYYY'))
    console.table(table, ["fondo", "tenencia", "calculo", "dif", "ok"])
}

function mostrarPorcentajeVariacion(variacion) {
    const total = document.querySelector("table > tbody > tr.totales > th:nth-child(7)");
    const abs = variacion.abs.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const rel = variacion.rel.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function leerLocalStorage(name) {
    let data = JSON.parse(localStorage.getItem(name));
    data ? data.forEach(el => el.fecha = moment(el.fecha)) : data
    return data
}

function rebuild() {
    const data = JSON.parse(localStorage.getItem('data'));
    let res = [];
    data.forEach(
        registro => res.push(
            new Registro(
                registro.fecha,
                registro.tipo,
                registro.fondo,
                registro.cuotapartes,
                registro.valor_cp,
                registro.tenencia,
                registro.resultado
            )
        )
    )
    return res
};

function guardarFondos(tabla, name) {
    if (tabla) {
        const data = leerLocalStorage(name);
        let dataFiltro = [];
        if (data)
            dataFiltro = data.filter(el => !(moment(el.fecha).isSame(moment(tabla[0].fecha))));
        tabla.forEach(el => {
            dataFiltro.unshift(el)
        });
        localStorage.setItem(name, JSON.stringify(dataFiltro));
        console.log(`Se guardaron los fondos en la memoria (${name}).`);
    }
    globalData = leerLocalStorage(name);
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

// document.addEventListener("DOMContentLoaded", function (event) {
//     console.log('dentro del ready');
//     var descargar = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer");
//     var btn = document.createElement("a");
//     descargar.appendChild(btn);
//     btn.id = "btnExt";
//     btn.innerText = "Guardar";
// });

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
    data = data || JSON.parse(localStorage.getItem('data'))
    to = to || data[0].fecha
    const datos = from ? data.reverse().filter(el => moment(el.fecha).isBetween(moment(from), moment(to), undefined, '[]')) : data.reverse()
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
                valor = null
                tenencia = null
            }

            valores.push(valor)
            tenencias.push(tenencia)
        })
        array.values.push(valores)
        array.holdings.push(tenencias)
    })
    const { days, labels, values, holdings } = array
    return { days, labels, values, holdings }
}

function injectChart() {
    const footer = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer")
    if (footer) {
        footer.style.height = "1300px"
        let prevChart = document.querySelector('div.chart-container2');
        const div1 = document.createElement("div");
        const div2 = document.createElement("div");
        const boton1 = document.createElement("button");
        const boton2 = document.createElement("button");
        const boton3 = document.createElement("button");
        const boton4 = document.createElement("button");
        const boton5 = document.createElement("button");
        div1.classList.add('chart-container2');
        div2.classList.add('chart-container3');
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
        boton1.style.margin = '5px';
        boton2.style.margin = '5px';
        boton3.style.margin = '5px';
        boton4.style.margin = '5px';
        boton5.style.margin = '5px';
        boton1.classList.add('toggleScale');
        boton2.classList.add('toggleScale');
        boton3.classList.add('toggleScale');
        boton4.classList.add('toggleScale');
        boton5.classList.add('toggleScale');
        div1.innerHTML = `<canvas id="myChart" aria-label="Hello ARIA World" role="img"></canvas>`;
        div2.innerHTML = `<canvas id="myChart2" aria-label="Hello ARIA World" role="img"></canvas>`;
        div2.style.marginTop = '50px';
        if (!prevChart) {
            footer.appendChild(boton1)
            footer.appendChild(boton2)
            footer.appendChild(boton3)
            footer.appendChild(boton4)
            // footer.appendChild(boton5)
            footer.appendChild(div1)
            footer.appendChild(div2)
        } else {
            return
        }
        moment.locale('es')
        setup();
        setup2();
    } else {
        return
    }
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
                    }]
        },
        options: {
            animation: {
                easing: 'easeOutElastic',
                duration: '1000',
                onComplete: function (animation) {
                }
            },
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
                intersect: true,
                // animationDuration: 0,
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
                            return translateDate(label);
                        },
                        minor: {
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        },
                    },
                    type: 'time',
                    distribution: 'linear',
                    time: {
                        displayFormats: {
                            month: 'MMM YYYY'
                        },
                        unit: 'month'
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
                duration: 1000,
                easing: 'easeOutElastic' // ["linear", "easeInQuad", "easeOutQuad", "easeInOutQuad",
                // "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart",
                // "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint",
                // "easeInOutQuint", "easeInSine", "easeOutSine", "easeInOutSine",
                // "easeInExpo", "easeOutExpo", "easeInOutExpo", "easeInCirc",
                // "easeOutCirc", "easeInOutCirc", "easeInElastic", "easeOutElastic",
                // "easeInOutElastic", "easeInBack", "easeOutBack", "easeInOutBack",
                // "easeInBounce", "easeOutBounce", "easeInOutBounce"]
            });
        });
    });
}

function delta(arr) {
    const res = [];
    let acc = 0
    arr.forEach((cur, ind, vec) => {
        let vari = (cur / vec[ind - 1] - 1) * 100 || 0
        acc = ((vari != Infinity)) ? acc + vari : acc
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

    let allData = getData(from);
    let allDataLength = allData.days.length;
    let chartData = chart.data;
    let chartDataLength = chartData.labels.length;

    const firstData = []
    const lastData = []
    firstData.holdings = []
    lastData.holdings = []
    firstData.values = []
    lastData.values = []

    firstData.days = allData.days.slice(0, allDataLength - chartDataLength);
    allData.holdings.forEach((arr, i) => firstData.holdings[i] = arr.slice(0, allDataLength - chartDataLength));
    allData.values.forEach((arr, i) => firstData.values[i] = arr.slice(0, allDataLength - chartDataLength));

    // console.log('first', firstData)

    lastData.days = allData.days.slice(allDataLength - chartDataLength);
    allData.holdings.forEach((arr, i) => lastData.holdings[i] = arr.slice(allDataLength - chartDataLength));
    allData.values.forEach((arr, i) => lastData.values[i] = arr.slice(allDataLength - chartDataLength));

    // console.log('last', lastData)

    firstData.days.reverse().forEach(dia => chart.data.labels.unshift(dia));
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y1').forEach((dataset, i) => {
        firstData.holdings[i].reverse().forEach(valor => dataset.data.unshift(valor));
    });
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y1').forEach(dataset => {
        dataset.data = toNumbers(dataset.data);
    })
    chart.data.datasets.filter(dataset => dataset.yAxisID === 'y').forEach((dataset, i) => {
        firstData.values[i].reverse().forEach(valor => {
            dataset.data.unshift(valor);
        });
        let k = 0;
        for (var j = firstData.days.length; j < dataset.data.length; j++) {
            dataset.data[j] = lastData.values[i][k];
            k++
        }
        dataset.data = delta(dataset.data);
    });
};

const toNumbers = array => array.map(val => val ? val : 0)
const toMonth = array => array.map(day => moment(day).subtract(moment(day).date() - 1, 'days').toJSON())

const monthlyProfit = () => {
    const data = rebuild();
    const fechas = [...new Set(data.map(el => el.fecha))].sort();
    const fondos = [...new Set(data.map(item => item.fondo))].sort();
    const months = [...new Set(fechas.map(el => moment(el).subtract(moment(el).date() - 1, 'days').toJSON()))];
    months.shift()
    const profits = [];
    fondos.forEach(fondo => {
        let profitsByFondo = [];
        months.forEach(month => {
            let profitsByMonth = 0;
            let filtered = data.filter(reg => {
                return reg.fondo === fondo &&
                    moment(reg.fecha).isBetween(moment(month), moment(month).add(1, 'months').subtract(1, 'days'), undefined, '[]')
            })
            // console.log(filtered);
            profitsByMonth = filtered.reduce((acc, cur) => acc + cur.getProfit(), 0);
            profitsByFondo.push(Math.round(profitsByMonth * 100) / 100);
        })
        profits.push(profitsByFondo)
    })
    return { months, fondos, profits }
}

const translateDate = input => {
    // let date = moment(input)
    const month = input.split(' ')[0].toLowerCase()
    const monName = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const mesName = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const newMonth = mesName[monName.findIndex(el => el === month)]
    const res = input.replace(/\w{3}/, newMonth)

    return res.replace(/(\w{3})\s(\w{1,2}\b)/g, '$2 $1')
}

async function setup2() {
    const ctx = document.getElementById('myChart2').getContext('2d');
    const data = monthlyProfit();
    console.log(data);
    const borderWidth = 1;
    let config = {
        type: 'bar',
        data: {
            labels: toMonth(data.months),
            datasets:
                [
                    {
                        order: 4,
                        barPercentage: 0.88,
                        categoryPercentage: .96,
                        label: data.fondos[0],
                        data: toNumbers(data.profits[0]),
                        borderWidth: borderWidth,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: `rgba(255, 99, 132, 0.2)`,
                        // spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        order: 5,
                        barPercentage: 0.88,
                        categoryPercentage: .96,
                        label: data.fondos[1],
                        data: toNumbers(data.profits[1]),
                        borderWidth: borderWidth,
                        borderColor: 'rgba(99, 200, 132, 1)',
                        backgroundColor: `rgba(99, 200, 132, 0.2)`,
                        // spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        order: 6,
                        barPercentage: 0.88,
                        categoryPercentage: .96,
                        label: data.fondos[2],
                        data: toNumbers(data.profits[2]),
                        borderWidth: borderWidth,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: `rgba(54, 162, 235, 0.2)`,
                        // spanGaps: true,
                        yAxisID: 'y1',
                    },
                    {
                        order: 7,
                        barPercentage: 0.88,
                        categoryPercentage: .96,
                        label: data.fondos[3],
                        data: toNumbers(data.profits[3]),
                        borderWidth: borderWidth,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: `rgba(153, 102, 255, 0.2)`,
                        // spanGaps: true,
                        yAxisID: 'y1',
                    }]
        },
        options: {
            animation: {
                easing: 'easeOutElastic',
                duration: '1000',
                onComplete: function (animation) {
                }
            },
            title: {
                display: true,
                text: 'Fondos Comunes de Inversión Resultado Mensual'
            },
            tooltips: {
                mode: 'x-axis',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                titleFontFamily: 'Open Sans',
                titleFontSize: 14,
                footerFontSize: 14,
                titleFontColor: 'rgba(0, 0, 0, 0.7)',
                titleFontStyle: 'bold',
                titleAlign: 'center',
                footerAlign: 'center',
                bodyFontFamily: 'Open Sans',
                // bodyFontSize: 14,
                bodyFontColor: 'rgba(0, 0, 0, 0.7)',
                footerFontColor: 'rgba(0, 0, 0, 0.7)',
                footerFontStyle: 'bold',
                borderColor: 'rgba(122, 122, 122, 0.2)',
                bodySpacing: 3,
                borderWidth: 1,
                callbacks: {
                    title: tooltipItem => tooltipItem[0] ? moment(tooltipItem[0].label).format('MMM YYYY').replace('.', '') : '',
                    label: (tooltipItem, data) => {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += `$${tooltipItem.yLabel.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        return label;
                    },
                    footer: (tooltipItem, data) => {
                        // console.log(tooltipItem);
                        return label = 'Total:            $' + tooltipItem.reduce((sum, cur) => cur.yLabel + sum, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                },
                filter: function (tooltipItem) {
                    return tooltipItem.datasetIndex < 4;
                },
                bodyAlign: 'right',
                position: 'average'
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
                    id: 'y1',
                    stacked: false,
                    ticks: {
                        // max: 20,
                        beginAtZero: true,
                        callback: value => `$ ${value.toLocaleString('de-DE')}`
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        offsetGridLines: true
                    },
                    offsetGridLines: true,
                    stacked: false,
                    ticks: {
                        callback: label => {
                            return moment(label).format('MMM YYYY').replace('.', '');
                        }
                    },
                    type: 'category',
                    // distribution: 'series',
                    time: {
                        displayFormats: {
                            month: 'MMM YYYY'
                        },
                        unit: 'month'
                    }
                }]
            }
        }
    };
    const myChart2 = new Chart(ctx, config);
}
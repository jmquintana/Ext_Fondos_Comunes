console.log('funciona script.js')
// guardarTabla();

function tablaDia() {
    let tablaHTML = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
    let registro = [];
    let hoy = dia(moment(new Date));
    // hoy = hoy;
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
    return registro
}

document.addEventListener("mouseup", acciones, false);

function acciones(e) {
    if (e.which == 2) {
        e.preventDefault();
        guardarTabla(tablaDia());
        mostrarPorcentajeVariacion(variacionResultado());
    }
}

const resultadoTotal = array => array.reduce((acumulador, { tenencia }) => acumulador + tenencia, 0);

function variacionResultado() {
    const resultadoHoy = resultadoTotal(tablaDia());
    const tabla = leerLocalStorage();
    const hoy = tablaDia()[0].fecha;
    const fechasAnteriores = tabla.map(el => el.fecha).filter(el => el.isBefore(hoy));
    const diaAnterior = moment.max(fechasAnteriores);
    const datosAnteriores = tabla.filter(el => el.fecha.isSame(diaAnterior));
    const resultadoAnterior = resultadoTotal(datosAnteriores);

    return {
        abs: (resultadoHoy - resultadoAnterior),
        rel: (resultadoHoy - resultadoAnterior) / resultadoAnterior * 100,
    };
}

function mostrarPorcentajeVariacion(variacion) {
    const total = document.querySelector("table > tbody > tr.totales > th:nth-child(7)");
    const rel = parseFloat(variacion.rel).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
    const abs = parseFloat(variacion.abs).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (variacion.abs >= 0) {
        total.innerText = `+$${abs} (+${rel})`
        total.style.color = "limegreen"
    } else {
        total.innerText = `$${abs} (${rel})`
        total.style.color = "red"
    };

    total.style.textAlign = "center"
    total.style.fontSize = "16px"
}

function Registro(fecha, tipo, fondo, cuotapartes, valor_cp, tenencia, resultado) {
    this.fecha = fecha;
    this.tipo = tipo;
    this.fondo = fondo;
    this.cuotapartes = cuotapartes;
    this.valor_cp = valor_cp;
    this.tenencia = tenencia;
    this.resultado = resultado;
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
    let data = leerLocalStorage();
    // let tabla = tablaDia();
    if (data && tabla) {
        for (var i = data.length - 1; i > -1; i--) {
            console.log(data[i].fecha.format('DD/MM/YYYY') == tabla[0].fecha.format('DD/MM/YYYY'));
            if (data[i].fecha.format('DD/MM/YYYY') == tabla[0].fecha.format('DD/MM/YYYY')) {
                data.splice(i, 1);
            }
        }
        for (var i = 0; i < tabla.length; i++) {
            data.unshift(tabla[i]);
        }
        localStorage.setItem('data', JSON.stringify(data));
    } else if (!data) {
        localStorage.setItem('data', JSON.stringify(tabla));
    }
    console.log('Se guardaron los datos en la memoria.');
}

function dia(date) {
    // var date = moment(date);
    if (date.hour() < 9) {
        date.subtract(1, 'day')
    }
    if (date.day() == 0) {
        date.add(1, 'day');
    } else if (date.day() == 6) {
        date.add(2, 'day');
    }
    return moment([date.year(), date.month(), date.date(), 0, 0, 0, 0])
}

document.addEventListener("DOMContentLoaded", function (event) {
    console.log('dentro del ready');
    var descargar = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer");
    var btn = document.createElement("a");
    descargar.appendChild(btn);
    btn.id = "btnExt";
    btn.innerText = "Guardar";
});

function traer(year) {
    fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
        .then(data => data.json())
        .then(res => res.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0])))
        // .then(res => console.log(res))
        .catch(err => console.error(err));
}

// async function traerAsync(year) {
//     try {
//         const resPost = await fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
//         // const feriados = resPost.json()
//         console.log(resPost.json());
//     } catch (error) {
//         console.log(error);
//     }
// }

function esFeriado(fecha) {
    let dia = moment(fecha);
    let year = fecha.getFullYear();
    fetch(`https://nolaborables.com.ar/api/v2/feriados/${year}`)
        .then(data => data.json())
        .then(res => res.map(el => el = moment([year, el.mes - 1, el.dia, 0, 0, 0, 0])))
        .then(res => console.log((res.filter(el => el.isSame(dia)).length == 1)))
        .catch(err => console.error(err));
}

async function isFeriado(fecha) {
    let dia = moment(fecha);
    let year = fecha.getFullYear();
    await traer(year)
        .then(res => console.log((res.filter(el => el.isSame(dia)).length == 1)))
        .catch(err => console.error(err));
}

// async function esFeriado(fecha) {
//     let year = fecha.getFullYear();
//     let feriados = await traer(year)
    // var feriados = await traer(fecha.getFullYear())

    // for (var i = 0; i < feriados.lenght; i++) {
    //     feriados[i].fecha = moment([year, feriados[i].mes, feriados[i].dia, 0, 0, 0, 0]);
    // }

    // let diasFeriados = await feriados.forEach(el => el.fecha = moment([year, el.mes, el.dia, 0, 0, 0, 0])).then(res => console.log(res));
    // diasFeriados = feriados.map(el => el.fecha)
    // console.log(feriados.forEach(el => el.fecha = moment([year, el.mes, el.dia, 0, 0, 0, 0])).then(res => console.log(res)));
// }
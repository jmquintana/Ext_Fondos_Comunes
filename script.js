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
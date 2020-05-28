console.log('funciona')
guardarTabla();

function tablaDia() {
    let tablaHTML = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div.tabla-contenedor.ng-scope > div.content-cuenta.ng-scope > div > div > div > table > tbody");
    let registro = [];
    let hoy = fecha(new Date);
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
    return JSON.parse(localStorage.getItem('data'));
}

function guardarTabla() {
    let data = leerLocalStorage();
    if (data) {
        let tabla = tablaDia();
        for (var i = 0; i < tabla.length; i++) {
            data.push(tabla[i]);
            localStorage.setItem('data', JSON.stringify(data));
        }
    } else {
        localStorage.setItem('data', JSON.stringify(tablaDia()));
    }
    console.log('Se guardaron los datos en la memoria.');
}

function fecha(date) {
    if (date.getHours() < 10) {
        date.setDate(date.getDate() - 1)
    }
    if (date.getDay() == 0) {
        date.setDate(date.getDate() + 1);
    } else if (date.getDay() == 6) {
        date.setDate(date.getDate() + 2);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

console.log('fuera del ready');

// var r = document.createElement('script');
var s = document.createElement('script');
var m = document.createElement('script');
var n = document.createElement('script');
//-----------------------------------------------------------------------------------
// r.src = chrome.runtime.getURL('jquery.min.js');
s.src = chrome.runtime.getURL('script.js');
m.src = chrome.runtime.getURL('moment.min.js');
n.src = chrome.runtime.getURL('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js');
//-----------------------------------------------------------------------------------
// r.onload = function () {
//     this.remove();
// };
s.onload = function () {
    this.remove();
};
m.onload = function () {
    this.remove();
};
n.onload = function () {
    this.remove();
};
//-----------------------------------------------------------------------------------
// (document.head || document.documentElement).appendChild(r);
(document.head || document.documentElement).appendChild(s);
(document.head || document.documentElement).appendChild(m);
(document.head || document.documentElement).appendChild(n);
//-----------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function (event) {
    $(window).bind('hashchange', function () {
        setTimeout(function () {
            //your code to be executed after 1 second
            console.log('dentro del ready');
            var descargar = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer");
            if (descargar) {
                var btn = document.createElement("a");
                descargar.appendChild(btn);
                btn.id = "btnExt";
                btn.innerText = "Guardar en Local Storage";
            }
        }, 2000);
    });
});

document.addEventListener("DOMContentLoaded", function (event) {
    $(window).bind('hashchange', function () {
        setTimeout(function () {
            //your code to be executed after 1 second
            console.log('dentro del ready');
            var descargar = document.querySelector("#main-view > fondos > div:nth-child(3) > fondos-tenencia > div:nth-child(4) > div > footer");
            if (descargar) {
                var canvas = document.createElement("canvas");
                descargar.appendChild(canvas);
                canvas.id = "chart";
                canvas.width = 400;
                canvas.height = 400;
            }
        }, 2000);
    });
});
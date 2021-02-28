console.log('fuera del ready');

var s = document.createElement('script');
var m = document.createElement('script');
var n = document.createElement('script');
var o = document.createElement('script');

s.src = chrome.runtime.getURL('script.js');
m.src = chrome.runtime.getURL('moment-with-locales.min.js');
n.src = chrome.runtime.getURL('chartjs-min.js');
o.src = chrome.runtime.getURL('chartjs-plugin-datalabels.min.js');

s.onload = () => this.remove();
m.onload = () => this.remove();
n.onload = () => this.remove();
o.onload = () => this.remove();

(document.head || document.documentElement).appendChild(s);
(document.head || document.documentElement).appendChild(m);
(document.head || document.documentElement).appendChild(n);
(document.head || document.documentElement).appendChild(o);

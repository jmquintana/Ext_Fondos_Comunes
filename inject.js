var s = document.createElement('script');
var m = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
m.src = chrome.runtime.getURL('moment.min.js');
s.onload = function () {
    this.remove();
};
m.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
(document.head || document.documentElement).appendChild(m);
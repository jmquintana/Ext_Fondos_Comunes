console.log('inject.js');

var s = document.createElement('script');
var m = document.createElement('script');
// var n = document.createElement('script');
var o = document.createElement('script');

s.src = chrome.runtime.getURL('script.js');
m.src = chrome.runtime.getURL('moment-with-locales.min.js');
// n.src = chrome.runtime.getURL('chartjs-min.js');
o.src = chrome.runtime.getURL('chartjs-plugin-datalabels.min.js');

s.onload = () => s.remove();
m.onload = () => m.remove();
// n.onload = () => n.remove();
o.onload = () => o.remove();

(document.head || document.documentElement).appendChild(s);
(document.head || document.documentElement).appendChild(m);
// (document.head || document.documentElement).appendChild(n);
(document.head || document.documentElement).appendChild(o);

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	let data = getData(msg.txt);
	chrome.runtime.sendMessage({
		response: 'Message received',
		name: msg.txt,
		data: JSON.parse(data),
	});
});

function getData(arg = 'data') {
	let data = localStorage.getItem(arg);
	return data;
}

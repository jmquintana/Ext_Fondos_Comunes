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

chrome.runtime.onMessage.addListener(function (arg, sender, sendResponse) {
	console.log('escucho...');
	let obj = JSON.parse(arg);
	console.log(obj);
	// let blob = new Blob([JSON.stringify(obj, null, 2)], {
	// 	type: 'application/json',
	// });
	// let url = URL.createObjectURL(blob);
	// // console.log(chrome.downloads);
	// chrome.downloads.download({
	// 	url: url, // The object URL can be used as download URL
	// 	//...
	// });

	// chrome.downloads.download({
	// 	url: img_url,
	// 	filename: saveas,
	// 	saveAs: false,
	// });
	// }
});

function sendResponse() {
	console.log('envia respuesta');
	const data = JSON.parse(localStorage.getItem('data'));
	chrome.runtime.sendMessage(data);
}

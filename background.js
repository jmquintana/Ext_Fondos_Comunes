console.log('background.js');

// function sendResponse() {
// 	chrome.runtime.sendMessage('respuesta');
// }

chrome.browserAction.onClicked.addListener(tab => download());

function download(arg = 'data') {
	console.log('escucho...');

	let data = localStorage.getItem(arg);

	let blob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json',
	});
	let url = URL.createObjectURL(blob);
	// console.log(chrome.downloads);
	chrome.downloads.download({
		url: url, // The object URL can be used as download URL
		//...
	});
}

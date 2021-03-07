console.log('popup.js');

let params = {
	active: true,
	currentWindow: true,
};
const sendMessage = e => {
	console.log(e);
	let msg = { txt: e.target.value };
	chrome.tabs.query(params, gotTabs);
	function gotTabs(tabs) {
		if (
			tabs[0].url.indexOf('https://www2.personas.santander.com.ar/') > -1
		) {
			chrome.tabs.sendMessage(tabs[0].id, msg);
		} else {
			console.log('Wrong site!');
		}
	}
};

document.querySelectorAll('button').forEach(btn => {
	btn.addEventListener('click', sendMessage);
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	let data = msg.data;
	let blob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json',
	});
	let url = URL.createObjectURL(blob);
	chrome.downloads.download({
		url: url,
		filename: msg.name + '.json',
		saveAs: false,
	});
	// sendResponse({
	// 	responde: 'descargado',
	// });
});

chrome.tabs.query(params, gotTabs);
function gotTabs(tabs) {
	if (tabs[0].url.indexOf('https://www2.personas.santander.com.ar/') === -1) {
		document
			.querySelectorAll('button')
			.forEach(btn => (btn.disabled = true));
	} else {
		console.log('enable');
	}
}

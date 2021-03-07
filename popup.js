console.log('popup.js');

const sendMessage = e => {
	console.log(e);
	let msg = { txt: e.target.value };
	let params = {
		active: true,
		currentWindow: true,
	};
	chrome.tabs.query(params, gotTabs);
	function gotTabs(tabs) {
		console.log(tabs[0].id, msg);
		chrome.tabs.sendMessage(tabs[0].id, msg);
	}
};

document.querySelectorAll('button').forEach(btn => {
	btn.addEventListener('click', sendMessage);
});

// chrome.browserAction.onClicked.addListener(sendMessage);

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

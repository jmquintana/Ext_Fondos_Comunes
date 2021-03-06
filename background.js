console.log('background.js');

const sendMessage = tab => {
	// console.log(tab);
	let msg = { txt: 'data' };
	chrome.tabs.sendMessage(tab.id, msg);
};

chrome.browserAction.onClicked.addListener(sendMessage);

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	let data = msg.data;

	let blob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json',
	});
	let url = URL.createObjectURL(blob);
	chrome.downloads.download({
		url: url,
		filename: 'data.json',
		saveAs: false,
	});
	sendResponse({
		responde: 'descargado',
	});
});

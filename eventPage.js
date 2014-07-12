function searchResultReceived(result, tabId) {
	if (result.foundWords) {
		chrome.browserAction.setIcon({
			path: "assets/red.png", 
			tabId: tabId
		});
	}
	else {
		chrome.browserAction.setIcon({
			path: "assets/gray.png", 
			tabId: tabId
		});
	}
}

function onMessageReceived(request, sender, sendResponse) {
	if (request.message = "search-result") {
		searchResultReceived(request, sender.tab.id);
	}
}

chrome.runtime.onMessage.addListener(onMessageReceived);

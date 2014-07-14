(function () {

	function init() {
		chrome.runtime.onMessage.addListener(onMessageReceived);

		chrome.contextMenus.create({
			id: "addKeyword", 
			title: "Add \"%s\"", 
			contexts: ["selection"]
		});

		chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
	}

	function searchResultsReceived(result, tabId) {
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
		if (request.message == "search-result") {
			searchResultsReceived(request, sender.tab.id);
		}
		else if (request.message == "get-keywords") {
			var keywords = storage.getKeywords();
			sendResponse(keywords);
		}
	}

	function onContextMenuClicked(info, tab) {
		if (info.menuItemId == "addKeyword") {
			var keyword = info.selectionText.trim();
			storage.addKeyword(keyword);
			highlightKeywords([keyword], tab.id);
		}
	}

	function highlightKeywords(keywords, tabId) {
		chrome.tabs.sendMessage(tabId, { message: "search-keywords", keywords: keywords });
	}

	init();

})();

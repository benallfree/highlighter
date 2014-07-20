(function () {

	function init() {
		chrome.runtime.onMessage.addListener(onMessageReceived);

		createContextMenus();

		chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
	}

	function createContextMenus() {
		chrome.contextMenus.create({
			id: "addKeyword", 
			title: "Add \"%s\"", 
			contexts: ["selection"]
		});
		
		chrome.contextMenus.create({
			id: "compose", 
			title: "Compose", 
			contexts: ["editable"]
		});
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
		else if (request.message == "get-skills") {
			var skills = storage.getSkills();
			sendResponse(skills);
		}
	}

	function onContextMenuClicked(info, tab) {
		if (info.menuItemId == "addKeyword") {
			var keyword = info.selectionText.trim();
			storage.addKeyword(keyword);
			highlightKeywords(storage.getKeywords(), tab.id);
		}
		else if (info.menuItemId == "compose") {
			chrome.tabs.sendMessage(tab.id, { message: "compose-textbox" });
		}
	}

	function highlightKeywords(keywords, tabId) {
		chrome.tabs.sendMessage(tabId, { message: "search-keywords", keywords: keywords });
	}

	init();

})();

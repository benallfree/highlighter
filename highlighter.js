(function () {
	var matchedKeywords = {};

	var myHilitor = new Hilitor();
	
	function init() {
		chrome.runtime.sendMessage({ message: "get-keywords" }, onKeywordsReceived);

		chrome.runtime.onMessage.addListener(onMessageReceived);
	}

	function onMessageReceived(request, sender, sendResponse) {
		if (request.message == "get-matched-keywords") {
			sendResponse({ matchedKeywords: matchedKeywords });
		}
		else if (request.message == "search-keywords") {
			onKeywordsReceived(request.keywords);
		}
	}

	function onKeywordsReceived(keywords) {
		matchedKeywords = myHilitor.apply(keywords, false);

		chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch });
	}

	init();
})();

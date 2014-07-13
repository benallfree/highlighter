(function () {
	var matchedKeywords = {};
	
	function init() {
		chrome.runtime.sendMessage({ message: "get-keywords" }, onKeywordsReceived);

		chrome.runtime.onMessage.addListener(onMessageReceived);
	}

	function onMessageReceived(request, sender, sendResponse) {
		if (request.message = "get-matched-keywords") {
			sendResponse({ matchedKeywords: matchedKeywords });
		}
	}

	function onKeywordsReceived(keywords) {
		var myHilitor = new Hilitor();
		matchedKeywords = myHilitor.apply(keywords);

		chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch });
	}

	init();
})();

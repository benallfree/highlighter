var data = {
	keywords: [
		"php", "wordpress", "laravel", "rails", "ruby on rails" 
	]
};

var myHilitor = new Hilitor();
var matchedKeywords = myHilitor.apply(data.keywords);

chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch });

function onMessageReceived(request, sender, sendResponse) {
	if (request.message = "get-matched-keywords") {
		sendResponse({ matchedKeywords: matchedKeywords });
	}
}

chrome.runtime.onMessage.addListener(onMessageReceived);

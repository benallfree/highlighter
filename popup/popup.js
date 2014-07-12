function matchedKeywordsResult(matchedKeywords) {
	var foundKeywords = document.getElementById("keywordsFound");
	for (var keyword in matchedKeywords) {
		if (matchedKeywords[keyword]) {
			var foundKeyword = document.createElement('div');
			foundKeyword.innerText = "* " + keyword;
			foundKeywords.appendChild(foundKeyword);
		}
	}
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get-matched-keywords"}, function(response) {
  	matchedKeywordsResult(response.matchedKeywords);
  });
});

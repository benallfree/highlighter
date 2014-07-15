function matchedKeywordsResult(matchedKeywords) {
	var foundKeywords = document.getElementById("keywordsFound");
	for (var keyword in matchedKeywords) {
		if (matchedKeywords[keyword] > 0) {

			var foundKeyword = document.createElement('div');
			foundKeyword.innerHTML = "* " + keyword + "<span class='count'>(" + matchedKeywords[keyword] + ")</span>";
			foundKeyword.attributes.count = matchedKeywords[keyword];

			var childNodes = foundKeywords.children;
			
			var inserted = false
			for (var i=0; i<childNodes.length; i++) {
				if (matchedKeywords[keyword] > childNodes[i].attributes.count) {
					foundKeywords.insertBefore(foundKeyword, childNodes[i]);
					inserted = true;
					break;
				}
			}

			if (!inserted) {
				foundKeywords.appendChild(foundKeyword);
			}
		}
	}
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get-matched-keywords"}, function(response) {
  	matchedKeywordsResult(response.matchedKeywords);
  });
});

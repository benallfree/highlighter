function matchedKeywordsResult(matchedKeywords) {
	var foundKeywords = document.getElementById("keywordsFound");
	for (var i=0; i<matchedKeywords.length; i++) {
		var matchedKeyword = matchedKeywords[i];

		var foundKeyword = document.createElement('div');
		foundKeyword.innerHTML = "* " + matchedKeyword.keyword + "<span class='count'>(" + matchedKeyword.count + ")</span>";
		
		foundKeywords.appendChild(foundKeyword);
	}
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get-matched-keywords"}, function(response) {
  	matchedKeywordsResult(response.matchedKeywords);
  });
});

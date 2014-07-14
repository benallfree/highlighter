(function () {
	var selectors = [
		{ check: "#jsJobResults", actual: "#jsJobResults article" },
		{ check: "#mcMessages", actual: "#mcMessages .oMessageGrid tr td:nth-child(3), #threadPosts .oMCMessageContent" },
		{ check: "#jobDescriptionSection", actual: "#jobDescriptionSection, #jobsJobsHeaderTitle, #jobHeaderTopLineSubcategory" },
		{ check: "#jobDetails", actual: "#jobDetails .jsTruncated, #jobDetails .jsFull p:first-child"},
		{ check: ".jsSearchResults", actual: ".jsSearchResults article" },
		{ check: ".oTable", actual: ".oTable tr td:nth-child(2)" }
	];

	var activeSelector = null,
		matchedKeywords = {},
		keywordsToSearch = null, 
		myHilitor = new Hilitor();
	
	function init() {
		activeSelector = getHighlightableAreaSelector();

		if (activeSelector) {
			chrome.runtime.sendMessage({ message: "get-keywords" }, function(keywords) {
				keywordsToSearch = keywords;
				highlightKeywords(true);

				document.arrive(activeSelector, function() {
					highlightKeywords(false, this);
				});
			});

			chrome.runtime.onMessage.addListener(onMessageReceived);	
		}
	}

	function onMessageReceived(request, sender, sendResponse) {
		if (request.message == "get-matched-keywords") {
			sendResponse({ matchedKeywords: matchedKeywords });
		}
		else if (request.message == "search-keywords") {
			keywordsToSearch = request.keywords;
			highlightKeywords(true);
		}
	}

	function getHighlightableAreaSelector() {
		for (var i=0; i<selectors.length; i++) {
			var elems = document.querySelectorAll(selectors[i].check);
			if (elems.length > 0) {
				return selectors[i].actual;
			}
		}
		return null;
	}

	function highlightKeywords(reset, elemsToSearch) {
		if (typeof elemsToSearch === "undefined") {
			elemsToSearch = document.querySelectorAll(activeSelector);

			// exclude 'more' link
			/*if (elemsToSearch[0].className == "jsTruncated") {
				elemsToSearch = [elemsToSearch[0].childNodes[0], elemsToSearch[1]];
			}*/
		}

		matchedKeywords = myHilitor.apply(elemsToSearch, keywordsToSearch, reset);

		chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch });
	}

	init();
})();

(function () {
	var selectors = [
		{ check: "#jsJobResults", actual: "#jsJobResults article" },
		{ check: "#mcMessages", actual: "#mcMessages .oMessageGrid tr td:nth-child(3), #threadPosts .oMCMessageContent" },
		{ check: "#jobDescriptionSection", actual: "#jobDescriptionSection, #jobsJobsHeaderTitle, #jobHeaderTopLineSubcategory" },
		// Apply to job page
		{ check: "#jobDetails", actual: "#jobDetails .jsTruncated, #jobDetails .jsFull p:first-child, #jobDetails .oFieldValue>p, #jobDetails .oFieldValue>h2"},
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
		else if (request.message == "compose-textbox") {
			composeTextbox(document.activeElement);
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

		chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch, matchedKeywords: matchedKeywords });
	}

	function composeTextbox(textbox) {
		chrome.runtime.sendMessage({ message: "get-skills", keywords: matchedKeywords }, function(skills) {

			var matchingSkills = getMatchingSkills(matchedKeywords, skills);
			if (matchingSkills.length > 0) {

				var combinedProps = getCombinedSkillsProps(matchingSkills), 
					combinedKeywords = getCombinedKeywords(matchedKeywords);

				var text = combinedProps.name + "? Look no further. I have deep experience in " + getCombinedKeywords(matchedKeywords) + " and would love to help.\n";
				text += "\n" + combinedProps.shortDesc + "\n";
				text +=	"\n" + combinedProps.longDesc + "\n";

				textbox.value = text;
			}
		});
	}

	function getMatchingSkills(keywords, skills) {
		var matchingSkills = [];

		for (var key in skills) {
			var skill = skills[key], 
				skillKeywords = skills[key].keywords;

			var skillMatchedKeywords = matchedKeywords.filter(function(keyword) {
				var keywordName = keyword.keyword.toLowerCase();
			    for (var i=0; i<skillKeywords.length; i++) {
			    	if (keywordName == skillKeywords[i].toLowerCase()) {
			    		return true;
			    	}
 			    }
 			    return false;
			});

			if (skillMatchedKeywords.length > 0) {
				skill.matchedKeywords = skillMatchedKeywords;
				skill.weight = calculateSkillWeight(skill);

				matchingSkills.push(skill);
			}
		}

		matchingSkills = matchingSkills.sort(function(skillA, skillB) {
			return skillB.weight > skillA.weight;
		});

		return matchingSkills;
	};

	function calculateSkillWeight(skill) {
		var skillWeight = 0;
		for (var i=0; i<skill.matchedKeywords.length; i++) {
			skillWeight += skill.matchedKeywords[i].count;
		}

		return skillWeight;
	}

	function getCombinedSkillsProps(skills) {
		var combinedProps = {
				name: skills[0].name, 
				shortDesc: "* " + skills[0].shortDesc, 
				longDesc: skills[0].longDesc
			};

		if (skills.length > 1) {
			for (var i=1; i<skills.length - 1; i++) {
				var skill = skills[i];
				combinedProps.name += ", " + skill.name;
				combinedProps.shortDesc += "\n* " + skill.shortDesc;
				combinedProps.longDesc += "\n\n" + skill.longDesc;
			}

			var skill = skills[skills.length -1];
			combinedProps.name += " and " + skill.name;
			combinedProps.shortDesc += "\n* " + skill.shortDesc;
			combinedProps.longDesc += "\n\n" + skill.longDesc;
		}

		return combinedProps;
	};

	function getCombinedKeywords(keywords) {
		var combinedKeywords = keywords[0].keyword;

		if (keywords.length > 1) {
			for (var i=1; i<keywords.length - 1; i++) {
				combinedKeywords += ", " + keywords[i].keyword;
			}

			combinedKeywords += " and " + keywords[keywords.length - 1].keyword;
		}

		return combinedKeywords;
	};

	init();
})();

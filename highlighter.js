var highlighter = new (function () {
	var selectors = [
		{ check: "#jsJobResults", actual: "#jsJobResults article", subSelector: ".oRowTitle, .oDescription, .oSkills", ignoreNodes: ['.oMore'] },
		{ check: "#mcMessages", actual: "#mcMessages .oMessageGrid tr td:nth-child(3), #threadPosts .oMCMessageContent" },
		// Job description page
		{ check: "#jobDescriptionSection", actual: "#jobDescriptionSection, #jobsJobsHeaderTitle, #jobHeaderTopLineSubcategory, #jobSkillsSection .oSkills", ignoreNodes: ['strong'] },
		// Apply to job page
		{ check: "#jobDetails", actual: "#jobDetails .jsTruncated, #jobDetails .jsFull p:first-child, #jobDetails .oFieldValue>p, #jobDetails .oFieldValue>h2, .oFormField-additionalQuestions .hint", ignoreNodes: ['.oMore']},
		{ check: ".jsSearchResults", actual: ".jsSearchResults article", subSelector: ".oRowTitle, .oDescription, .oSkills", ignoreNodes: ['.oMore']  },
		{ check: ".oTable", actual: ".oTable tr td:nth-child(2)" }
	];

	var activeSelector = null,
		matchedKeywords = {},
		keywordsToSearch = null, 
		passedKeywordsElem = null,
		skills = null,
		myHilitor = new Hilitor();
	
	function init() {
		var keywordsParam = Utils.getParameterByName("_oes");
		passedKeywordsElem = document.createElement("div");
		passedKeywordsElem.innerText = keywordsParam;

		activeSelector = getHighlightableAreaSelector();

		if (activeSelector) {
			chrome.runtime.sendMessage({ message: "get-keywords" }, function(keywords) {
				keywordsToSearch = keywords;

				chrome.runtime.sendMessage({ message: "get-skills" }, function(allSkills) {
					skills = allSkills;

					keywordsToPassToNextPage();

					highlightKeywords(true);

					document.arrive(activeSelector.actual, function() {
						highlightKeywords(false, this);
					});
				});
			});

			chrome.runtime.onMessage.addListener(onMessageReceived);
		}

		window.addEventListener("message", messageFromIframe, false);
	}

	function onMessageReceived(request, sender, sendResponse) {
		if (request.message == "get-matched-keywords") {
			sendResponse({ matchedKeywords: matchedKeywords });
		}
		else if (request.message == "search-keywords") {
			keywordsToSearch = request.keywords;
			chrome.runtime.sendMessage({ message: "get-skills" }, function(allSkills) {
				skills = allSkills;
				highlightKeywords(true);
			});
		}
		else if (request.message == "compose") {
			composeTextbox(document.activeElement, request.menuId, request.template);
		}
		else if (request.message == "open-overlay") {
			openOverlay(request.url);
		}
	}

	function getHighlightableAreaSelector() {
		for (var i=0; i<selectors.length; i++) {
			var elems = document.querySelectorAll(selectors[i].check);
			if (elems.length > 0) {
				return selectors[i];
			}
		}
		return null;
	}

	function highlightKeywords(reset, elemsToSearch) {
		if (typeof elemsToSearch === "undefined") {
			elemsToSearch = document.querySelectorAll(activeSelector.actual);

			// exclude 'more' link
			/*if (elemsToSearch[0].className == "jsTruncated") {
				elemsToSearch = [elemsToSearch[0].childNodes[0], elemsToSearch[1]];
			}*/
		}

		if (!(elemsToSearch instanceof Array)) {
			if (typeof elemsToSearch.length === "undefined") {
				elemsToSearch = [elemsToSearch];
			}
			else {
				elemsToSearch = Array.prototype.slice.call(elemsToSearch);
			}
		}

		if (activeSelector.subSelector) {
			elemsToSearch = Utils.querySelectorAll(elemsToSearch, activeSelector.subSelector);
		}

		elemsToSearch.push(passedKeywordsElem);

		matchedKeywords = myHilitor.apply(elemsToSearch, keywordsToSearch, reset, activeSelector.ignoreNodes);

		chrome.runtime.sendMessage({ message: "search-result", foundWords: myHilitor.foundMatch, matchedKeywords: matchedKeywords });
	}

	function keywordsToPassToNextPage() {
		if (activeSelector.check == "#jobDescriptionSection") {
			var $applyBtn = document.querySelectorAll(".oBtnPrimary[href^='/job/']")[0];

			if ($applyBtn) {
				var paraHeadingsToExclude = [
					"job description:"
				];

				var parasToInclude = [];

				$jobDescriptionParagraphs = document.querySelectorAll("#jobDescriptionSection div[name='sku'] > p");
				for (var i=0; i<$jobDescriptionParagraphs.length; i++) {
					var $heading = $jobDescriptionParagraphs[i].querySelectorAll("strong")[0];
					if ($heading) {
						var paraTitle = $heading.innerText.toLowerCase();
						if (paraTitle.length > 0 && paraHeadingsToExclude.indexOf(paraTitle) === -1) {
							parasToInclude.push($jobDescriptionParagraphs[i]);
						}
					}
				}

				var tempHilitor = new Hilitor();
				var matchedKws = tempHilitor.apply(parasToInclude, keywordsToSearch, true);

				var keywordsParam = "";
				for (var i=0; i<matchedKws.length; i++) {
					if (i !== 0) {
						keywordsParam += ",";
					}
					keywordsParam += matchedKws[i].keyword;
				}

				if (keywordsParam.length > 0) {
					$applyBtn.href += "?_oes=" + encodeURIComponent(keywordsParam);
				}
			}
		}
	}

	function composeTextbox(textbox, menuId, template) {
		chrome.runtime.sendMessage({ message: "get-skills", keywords: matchedKeywords }, function(skills) {

			var matchingSkills = getMatchingSkills(matchedKeywords, skills);
			if (matchingSkills.length > 0) {

				var combinedProps = getCombinedSkillsProps(matchingSkills), 
					combinedKeywords = getCombinedKeywords(matchedKeywords);

				var text = template.body;

				text = text.replace("[skill_list]", combinedProps.name);
				text = text.replace("[skill_bullets]", combinedProps.shortDesc);
				text = text.replace("[skill_descriptions]", combinedProps.longDesc);

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
			return skillB.weight - skillA.weight;
		});

		return matchingSkills;
	}

	this.getMatchingSkillsNames = function(keyword) {
		var matchingSkills = [];

		keyword = keyword.toLowerCase();

		for (var key in skills) {
			var skill = skills[key], 
				skillKeywords = skills[key].keywords;

			for (var i=0; i<skillKeywords.length; i++) {
				if (keyword == skillKeywords[i].toLowerCase()) {
					matchingSkills.push(skill);
					break;
				}
			}
		}

		matchingSkills = matchingSkills.sort(function(skillA, skillB) {
			return skillA.name > skillB.name ? 1 : (skillA.name < skillB.name ? -1 : 0);
		});

		var skillNames = "";
		for (var i=0; i<matchingSkills.length; i++) {
			if (i !== 0) {
				skillNames += ", ";
			}
			skillNames += matchingSkills[i].name;
		}

		return skillNames;
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
	}

	function getCombinedKeywords(keywords) {
		var combinedKeywords = keywords[0].keyword;

		if (keywords.length > 1) {
			for (var i=1; i<keywords.length - 1; i++) {
				combinedKeywords += ", " + keywords[i].keyword;
			}

			combinedKeywords += " and " + keywords[keywords.length - 1].keyword;
		}

		return combinedKeywords;
	}

	function openOverlay(url) {
		var iframe = document.createElement("iframe");
		iframe.className = "highlighter-overlay";
		iframe.src = url;

		document.body.appendChild(iframe);
	}

	function messageFromIframe(event)
	{
		if (event.origin.indexOf("chrome-extension" == 0)) {
			if (event.data.type = "close-overlay") {
				var iframes = document.getElementsByClassName("highlighter-overlay");
				if (iframes.length > 0) {
					var iframe = iframes[iframes.length - 1];
					iframe.parentElement.removeChild(iframe);
				}
			}
		}
	}


	init();
})();

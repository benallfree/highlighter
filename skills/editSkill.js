(function() {

	var keywordTemplate = document.getElementById("keywordTemplate"), 
		editForm = document.getElementById("editForm")
		skillName = document.getElementById("skillName"), 
		shortDesc = document.getElementById("short_desc"), 
		longDesc = document.getElementById("long_desc"), 
		keywords = document.getElementById("keywords"), 
		cancel = document.getElementById("cancel"), 
		save = document.getElementById("save"), 
		keywordTextbox = document.getElementById("keywordTextbox"), 
		oldName = null;

	function init() {
		addKeywordAutoComplete();

		keywordTextbox.addEventListener("keydown", keywordBoxKeyPress);

		cancel.addEventListener("click", function() {
			location.href = "/skills/index.html";
		});

		editForm.addEventListener("submit", onFormSubmitted);

		var key = Utils.getParameterByName("key");
		if (key !== null) {
			loadSkillFromStorage(key);
		}

		var keywordsToAdd = getQueryParam("keywords");
		if (keywordsToAdd) {
			keywordsToAdd = JSON.parse(keywordsToAdd);
			addKeywords(keywordsToAdd);
		}
	}

	function getQueryParam(paramName) {
	    paramName = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + paramName + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function addKeywordAutoComplete() {
		var storedKeywords = storage.getKeywords();
		autoComplt.enable(keywordTextbox, {
			hintsFetcher : function (input, openList) {
				var hints = [];

				for (var i = 0; i < storedKeywords.length; i++) {
					if (storedKeywords[i].indexOf(input) >= 0) {
						hints.push(storedKeywords[i]);
					}
				}

				openList(hints);
			}
		});
	}

	function loadSkillFromStorage(key) {
		var skill = storage.getSkill(key);
		if (skill) {
			skillName.value = skill.name;
			shortDesc.value = skill.shortDesc;
			longDesc.value = skill.longDesc;
			addKeywords(skill.keywords);

			oldName = skill.name;
		}
	}

	function keywordBoxKeyPress(e) {
		if (e.keyCode == 13) {
			e.preventDefault();

			if (this.value.length > 0) {
				addKeywords(this.value.split(","));
				this.value = "";
			}
		}
	}

	function addKeyword(keyword) {
		keyword = keyword.trim();
		if (!keywordAlreadyExist(keyword)) {
			var keywordElem = keywordTemplate.cloneNode(true);
			keywordElem.removeAttribute("id");
			keywordElem.getElementsByClassName("text")[0].innerText = keyword;
			keywordElem.getElementsByClassName("cross")[0].addEventListener("click", removeKeyword);
			keywords.appendChild(keywordElem);
		}
	}

	function addKeywords(keywords) {
		for (var i=0; i<keywords.length; i++) {
			addKeyword(keywords[i]);
		}
	};

	function keywordAlreadyExist(keyword) {
		var keywordsElem = keywords.querySelectorAll(".keyword .text");

		var lowerCaseKeyword = keyword.toLowerCase();

		for (var i=0; i<keywordsElem.length; i++) {
			if (keywordsElem[i].innerText.toLowerCase() == lowerCaseKeyword) {
				return true;
			}
		}

		return false;
	}

	function removeKeyword() {
		var keywordElem = this.parentElement;
		keywordElem.parentElement.removeChild(keywordElem);
	}

	function onFormSubmitted(e) {
		e.preventDefault();

		var keywordsElem = keywords.querySelectorAll(".keyword .text");

		var keywordsArr = [];
		for (var i=0; i<keywordsElem.length; i++) {
			keywordsArr.push(keywordsElem[i].innerText);
		}

		var skill = {
			name: skillName.value.trim(), 
			shortDesc: shortDesc.value.trim(), 
			longDesc: longDesc.value.trim(), 
			keywords: keywordsArr
		}

		if (oldName !== null && oldName !== skill.name) {
			storage.removeSkill(oldName);
		}

		storage.addSkill(skill);

		e.preventDefault();

		location.href = "/skills/index.html";
	}

	init();
})();

(function() {

	var keywordTemplate = document.getElementById("keywordTemplate"), 
		editForm = document.getElementById("editForm")
		skillName = document.getElementById("skillName"), 
		shortDesc = document.getElementById("short_desc"), 
		longDesc = document.getElementById("long_desc"), 
		keywords = document.getElementById("keywords"), 
		cancel = document.getElementById("cancel"), 
		save = document.getElementById("save"), 
		oldName = null;

	function init() {
		var keywordTextbox = document.getElementById("keywordTextbox");
		keywordTextbox.addEventListener("keypress", keywordBoxKeyPress);

		cancel.addEventListener("click", function() {
			location.href = "/skills/index.html";
		});

		editForm.addEventListener("submit", onFormSubmitted);

		var key = getParameterByName("key");
		if (key !== null) {
			loadSkillFromStorage(key);
		}
	}

	function loadSkillFromStorage(key) {
		var skill = storage.getSkill(key);
		if (skill) {
			skillName.value = skill.name;
			shortDesc.value = skill.shortDesc;
			longDesc.value = skill.longDesc;

			for (var i=0; i<skill.keywords.length; i++) {
				addKeyword(skill.keywords[i]);
			}

			oldName = skill.name;
		}
	}

	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function keywordBoxKeyPress(e) {
		if (e.keyCode == 13) {
			e.preventDefault();

			if (this.value.length > 0) {
				addKeyword(this.value);
				this.value = "";
			}
		}
	}

	function addKeyword(keyword) {
		if (!keywordAlreadyExist(keyword)) {
			var keywordElem = keywordTemplate.cloneNode(true);
			keywordElem.removeAttribute("id");
			keywordElem.getElementsByClassName("text")[0].innerText = keyword;
			keywordElem.getElementsByClassName("cross")[0].addEventListener("click", removeKeyword);
			keywords.appendChild(keywordElem);
		}
	}

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
		if(!this.checkValidity())
		{
			e.preventDefault();
			return;
		}

		var keywordsElem = keywords.querySelectorAll(".keyword .text");

		var keywordsArr = [];
		for (var i=0; i<keywordsElem.length; i++) {
			keywordsArr.push(keywordsElem[i].innerText);
		}

		var skill = {
			name: skillName.value, 
			shortDesc: shortDesc.value, 
			longDesc: longDesc.value, 
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

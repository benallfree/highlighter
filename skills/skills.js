(function() {

	var skillsTable = document.getElementById("skillsTable"),
		skills = storage.getSkills()
		keywordTemplate = document.getElementById("keywordTemplate");

	function init() {
		displaySkills(skills);
	}

	function displaySkills(skills) {
		for (var skillName in skills) {
			var skill = skills[skillName];
			displaySkill(skillName, skill);
		}
	}

	function displaySkill(key, skill) {
		var skillTemplate = document.getElementById("skillTemplate");

		var skillElem = skillTemplate.cloneNode(true);
		skillElem.removeAttribute("id");
		skillElem.getElementsByClassName("skillName")[0].innerText = skill.name;
		skillElem.getElementsByClassName("shortDesc")[0].innerText = skill.shortDesc;
		skillElem.getElementsByClassName("longDesc")[0].innerText = skill.longDesc;
		skillElem.getElementsByClassName("edit")[0].href = "/skills/edit.html?key=" + key;

		var deleteBtn = skillElem.getElementsByClassName("delete")[0];
		deleteBtn.setAttribute("data-skill-key", key);
		deleteBtn.setAttribute("data-skill-name", skill.name);
		deleteBtn.addEventListener("click", onRemoveSkillClicked);

		var keywords = skillElem.getElementsByClassName("keywords")[0];

		for (var i=0; i<skill.keywords.length; i++) {
			var keywordElem = keywordTemplate.cloneNode(true);
			keywordElem.removeAttribute("id");
			keywordElem.getElementsByClassName("text")[0].innerText = skill.keywords[i];
			keywords.appendChild(keywordElem);
		}
		
		skillsTable.appendChild(skillElem);
	}

	function onRemoveSkillClicked(e) {
		var skillName = this.getAttribute("data-skill-name");
		if (confirm("Are you sure you want to delete skill " + skillName + "?")) {
			var key = this.getAttribute("data-skill-key");
			storage.removeSkill(key);
		} else {
			e.preventDefault();
		}
		
	}

	init();
})();

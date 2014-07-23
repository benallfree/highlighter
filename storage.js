var storage = new (function() {

	var defaultKeywords = [
		"php", "wordpress", "laravel", "rails", "ruby on rails" 
	];

	function storeObject(name, obj) {
		localStorage.setItem(name, JSON.stringify(obj));
		return obj;
	}

	function getObject(name, defaultValue, storeFunc) {
		var obj = localStorage.getItem(name);
		if (!obj) {
			obj = storeFunc.call(null, defaultValue);
		}
		else {
			obj = JSON.parse(obj);
		}
		return obj;
	}

	function storeKeywords(keywords) {
		keywords = keywords.sort(function(a, b) {
			return a.length < b.length;
		});

		storeObject("search_keywords", keywords);

		return keywords;
	}

	this.getKeywords = function() {
		var keywords = getObject("search_keywords", defaultKeywords, storeKeywords);
		return keywords;
	};

	this.addKeyword = function(keyword) {
		var lowerCaseKeyword = keyword.toLowerCase();
		var keywords = this.getKeywords();

		for (var i=0; i<keywords.length; i++) {
			if (lowerCaseKeyword == keywords[i].toLowerCase()) {
				return false;
			}
		}

		keywords.push(keyword);
		storeKeywords(keywords);

		return true;
	};

	function storeSkills(skills) {
		return storeObject("skills", skills)
	}

	this.getSkills = function() {
		return getObject("skills", {}, storeSkills);
	};

	this.addSkill = function(skill) {
		var lowerCaseSkillName = skill.name.toLowerCase();
		var skills = this.getSkills();

		skills[lowerCaseSkillName] = skill;

		for (var i=0; i<skill.keywords.length; i++) {
			this.addKeyword(skill.keywords[i]);
		}

		storeSkills(skills);

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.eventPage.createAddKeywordContextMenuForSkill(skill.name);
		});
	};

	this.removeSkill = function(key) {
		var skills = this.getSkills();
		var lowerCaseKey = key.toLowerCase();
		var skillName = skills[lowerCaseKey].name;
		delete skills[lowerCaseKey];
		storeSkills(skills);

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.eventPage.removeAddKeywordContextMenuForSkill(skillName);
		});
	};

	this.getSkill = function(key) {
		var skills = this.getSkills();
		return skills[key.toLowerCase()];
	};

	this.addKeywordToSkill = function(skillName, keyword) {
		var skills = this.getSkills();
		skills[skillName.toLowerCase()].keywords.push(keyword);
		this.addKeyword(keyword);
		storeSkills(skills);
	};

})();

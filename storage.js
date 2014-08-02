var storage = new (function() {

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

	this.getKeywords = function() {
		var keywords = [];
		var skills = this.getSkills();

		for (var skill_name in skills)
		{
			var skill = skills[skill_name];
			for (var i=0; i<skill.keywords.length; i++) {
				keywords.push(skill.keywords[i].toLowerCase());
			}
		}

		keywords = keywords.filter( function(value, index, self) { 
			return self.indexOf(value) === index;
		});

		keywords = keywords.sort(function(keywordA, keywordB) {
			return keywordB.length - keywordA.length;
		});

		return keywords;
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

		storeSkills(skills);

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.eventPage.createAddKeywordContextMenuForSkill(skill.name);
			bg.eventPage.highlightKeywordsInAllTabs();
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
			bg.eventPage.highlightKeywordsInAllTabs();
		});
	};

	this.getSkill = function(key) {
		var skills = this.getSkills();
		return skills[key.toLowerCase()];
	};

	this.addKeywordToSkill = function(skillName, keyword) {
		var skills = this.getSkills();
		var is_found = false;
		var keywords = skills[skillName.toLowerCase()].keywords;
		for (var i=0; i<keywords.length; i++) {
	  		if(keywords[i].toLowerCase() == keyword.toLowerCase())
			{
				is_found = true;
				break;
			}
		}
		if(!is_found)
		{
			skills[skillName.toLowerCase()].keywords.push(keyword);
			storeSkills(skills);

			chrome.runtime.getBackgroundPage(function(bg) {
				bg.eventPage.highlightKeywordsInAllTabs();
			});
		}
	};

	function storeTemplates(templates) {
		return storeObject("templates", templates)
	}

	this.getTemplates = function() {
		return getObject("templates", {}, storeTemplates);
	};

	this.addTemplate = function(id, template) {
		var templates = this.getTemplates();

		templates[id] = template;

		storeTemplates(templates);

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.eventPage.createComposeContextMenuForTemplate(id, template);
		});
	};

	this.removeTemplate = function(id) {
		var templates = this.getTemplates();
		delete templates[id];
		storeTemplates(templates);

		chrome.runtime.getBackgroundPage(function(bg) {
			bg.eventPage.removeComposeContextMenuForTemplate(id);
		});
	}

	this.getTemplate = function(id) {
		var templates = this.getTemplates();
		return templates[id];
	};

})();

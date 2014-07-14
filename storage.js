var storage = new (function() {

	var defaultKeywords = [
		"php", "wordpress", "laravel", "rails", "ruby on rails" 
	];

	function storeKeywords(keywords) {
		keywords = keywords.sort(function(a, b) {
			return a.length < b.length;
		});

		localStorage.setItem("search_keywords", JSON.stringify(keywords));

		return keywords;
	}

	this.getKeywords = function() {
		var keywords = localStorage.getItem("search_keywords");
		if (!keywords) {
			keywords = defaultKeywords;
			keywords = storeKeywords(keywords);
		}
		else {
			keywords = JSON.parse(keywords);
		}
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

})();

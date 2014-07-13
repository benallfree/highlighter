var storage = new (function() {

	var defaultKeywords = [
		"php", "wordpress", "laravel", "rails", "ruby on rails" 
	];

	this.getKeywords = function() {
		var keywords = localStorage.getItem("search_keywords");
		if (!keywords) {
			keywords = defaultKeywords;
			localStorage.setItem("search_keywords", JSON.stringify(keywords));
		}
		else {
			keywords = JSON.parse(keywords);
		}
		return keywords;
	};

	this.addKeyword = function(keyword) {
		var keywords = this.getKeywords();
		keywords.push(keyword);
		localStorage.setItem("search_keywords", JSON.stringify(keywords));
	};

})();

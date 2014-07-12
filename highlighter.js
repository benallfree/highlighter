var data = {
	keywords: [
		"php", "wordpress", "laravel", "ruby on rails", "rails", 
	]
}

var myHilitor = new Hilitor();
myHilitor.apply(data.keywords.join("|"));

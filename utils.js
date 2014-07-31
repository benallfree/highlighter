var Utils = new (function() {

	this.getParameterByName = function(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	// to call querySelectorAll on NodeList/array
	this.querySelectorAll = function(elems, selector) {
		var selectedElems = [];
		for (var i=0; i<elems.length; i++) {
			var newElems = Array.prototype.slice.call(elems[i].querySelectorAll(selector));
			Array.prototype.push.apply(selectedElems, newElems);
		}
		return selectedElems;
	}

	this.quoteAttr = function(s, preserveCR) {
		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s) /* Forces the conversion to string. */
			.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
			.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			/*
			You may add other replacements here for HTML only 
			(but it's not necessary).
			Or for XML, only if the named entities are defined in its DTD.
			*/ 
			.replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
			.replace(/[\r\n]/g, preserveCR);
			;
	}

})();

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

})();

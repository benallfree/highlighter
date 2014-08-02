(function() {

	var templatesTable = document.getElementById("templatesTable"),
		templates = storage.getTemplates();

	function init() {
		displayTemplates(templates);
	}

	function displayTemplates(templates) {
		for (var templateId in templates) {
			var template = templates[templateId];
			displayTemplate(templateId, template);
		}
	}

	function displayTemplate(id, template) {
		var templateRow = document.getElementById("templateRow");

		var templateElem = templateRow.cloneNode(true);
		templateElem.removeAttribute("id");
		templateElem.getElementsByClassName("templateName")[0].innerText = template.name;
		templateElem.getElementsByClassName("edit")[0].href = "/templates/edit.html?id=" + id;

		var deleteBtn = templateElem.getElementsByClassName("delete")[0];
		deleteBtn.setAttribute("data-template-id", id);
		deleteBtn.addEventListener("click", onRemoveTemplateClicked);
		
		templatesTable.appendChild(templateElem);
	}

	function onRemoveTemplateClicked(e) {
		var templateId = this.getAttribute("data-template-id");
		if (confirm("Are you sure you want to delete the template?")) {
			storage.removeTemplate(templateId);
		} else {
			e.preventDefault();
		}
		
	}

	init();
})();

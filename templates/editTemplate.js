(function() {

	var editForm = document.getElementById("editForm"), 
		templateName = document.getElementById("templateName"), 
		templateBody = document.getElementById("templateBody"), 
		cancel = document.getElementById("cancel"), 
		save = document.getElementById("save"), 
		templateId;

	function init() {
		cancel.addEventListener("click", function() {
			location.href = "/templates/index.html";
		});

		editForm.addEventListener("submit", onFormSubmitted);

		var id = Utils.getParameterByName("id");
		if (id !== "") {
			loadTemplateFromStorage(id);
		}
	}

	function loadTemplateFromStorage(id) {
		var template = storage.getTemplate(id);
		if (template) {
			templateName.value = template.name;
			templateBody.value = template.body;

			templateId = id;
		}
	}

	function onFormSubmitted(e) {
		e.preventDefault();

		var template = {
			name: templateName.value.trim(), 
			body: templateBody.value.trim()
		}

		if (!templateId) {
			templateId = Utils.randomStr();
		}

		storage.addTemplate(templateId, template);

		e.preventDefault();

		location.href = "/templates/index.html";
	}

	init();
})();

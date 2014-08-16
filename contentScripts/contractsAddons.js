(function () {

	function init() {
		showHoursSinceStart();
	}

	function showHoursSinceStart() {
		var $hourlyContracts = document.getElementById("hourlyContracts");
		$hourlyContracts = $hourlyContracts.getElementsByTagName("tr");

		for (var i=0; i<$hourlyContracts.length; i++) {
			var $contractLink = $hourlyContracts[i].querySelectorAll(".oDividerList li:first-child a");
			if ($contractLink.length > 0) {
				showHoursForContract($hourlyContracts[i], $contractLink[0].href);
			}
			else {
				console.error("Contract link not found!");
			}
		}
	}

	function showHoursForContract($contract, contractUrl) {
		fetchContractDetails(contractUrl, function (responseText) {
			var $parsedHtml = document.createElement("div");
			$parsedHtml.innerHTML = responseText;
			var $hours = $parsedHtml.getElementsByClassName("oRateLarge");
			if ($hours.length >= 3) {
				var hoursSinceStart = $hours[2].innerText.trim();

				var $hoursSinceStart = document.createElement("div");
				$hoursSinceStart.className = "oMute";
				$hoursSinceStart.innerText = hoursSinceStart + " since start";

				var $injectionPoint = $contract.querySelectorAll(".txtRight .oMute")[0];
				$injectionPoint.parentElement.insertBefore($hoursSinceStart, $injectionPoint.nextSibling);
			}
			else {
				console.error("Hours element not found. $hours.length = " + $hours.length);
			}
		});
	}

	function fetchContractDetails(url, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState==4) {
				if (xmlhttp.status==200) {
					callback(xmlhttp.responseText);
				}
				else {
					console.error("Could not fetch contract details.");
				}
			}
		}
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}


	init();
})();

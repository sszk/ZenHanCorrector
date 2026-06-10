(function () {
  "use strict";

  var enabledInput = document.getElementById("enabled");
  var statusText = document.getElementById("status");
  var refreshButton = document.getElementById("refresh");

  function updateStatus(enabled) {
    statusText.textContent = enabled ? "変換は有効です" : "変換は無効です";
    refreshButton.disabled = !enabled;
  }

  chrome.storage.sync.get({ enabled: true }, function (items) {
    enabledInput.checked = items.enabled;
    updateStatus(items.enabled);
  });

  enabledInput.addEventListener("change", function () {
    var enabled = enabledInput.checked;

    chrome.storage.sync.set({ enabled: enabled }, function () {
      updateStatus(enabled);
    });
  });

  refreshButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0] || !tabs[0].id) {
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: "ZENHAN_RECONVERT" });
      window.close();
    });
  });
}());

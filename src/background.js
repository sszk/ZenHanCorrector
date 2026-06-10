(function () {
  "use strict";

  var STORAGE_KEY = "enabled";

  function updateBadge(enabled) {
    chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: enabled ? "#1a73e8" : "#5f6368" });
    chrome.action.setTitle({
      title: enabled ? "ZenHan Corrector: 有効" : "ZenHan Corrector: 無効"
    });
  }

  function loadState(callback) {
    chrome.storage.sync.get({ enabled: true }, function (items) {
      callback(items[STORAGE_KEY]);
    });
  }

  function toggleEnabled() {
    loadState(function (enabled) {
      chrome.storage.sync.set({ enabled: !enabled });
    });
  }

  chrome.runtime.onInstalled.addListener(function () {
    loadState(updateBadge);
  });

  chrome.runtime.onStartup.addListener(function () {
    loadState(updateBadge);
  });

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      updateBadge(changes[STORAGE_KEY].newValue);
    }
  });

  chrome.commands.onCommand.addListener(function (command) {
    if (command === "toggle-enabled") {
      toggleEnabled();
    }
  });

  loadState(updateBadge);
}());

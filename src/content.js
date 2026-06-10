(function () {
  "use strict";

  var STORAGE_KEY = "enabled";
  var convertedNodes = new WeakMap();
  var convertedAttributes = new WeakMap();
  var changedByExtension = new WeakSet();
  var observer = null;

  function isEditableElement(element) {
    return element && (
      element.isContentEditable ||
      element.tagName === "TEXTAREA" ||
      element.tagName === "INPUT" ||
      element.tagName === "SELECT"
    );
  }

  function shouldSkipTextNode(node) {
    var parent = node.parentElement;

    if (!parent) {
      return true;
    }

    if (isEditableElement(parent)) {
      return true;
    }

    return Boolean(parent.closest("script, style, textarea, input, select, option, code, pre, [contenteditable='true']"));
  }

  function convertTextNode(node) {
    if (shouldSkipTextNode(node)) {
      return;
    }

    var original = convertedNodes.get(node) || node.nodeValue;
    var converted = window.ZenHanCorrector.convertText(original);

    if (converted !== node.nodeValue) {
      changedByExtension.add(node);
      node.nodeValue = converted;
    }

    if (converted !== original) {
      convertedNodes.set(node, original);
    }
  }

  function restoreTextNode(node) {
    var original = convertedNodes.get(node);

    if (original !== undefined) {
      changedByExtension.add(node);
      node.nodeValue = original;
      convertedNodes.delete(node);
    }
  }

  function walkTextNodes(root, callback) {
    if (!root) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      callback(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }

    if (root.nodeType === Node.ELEMENT_NODE && isEditableElement(root)) {
      return;
    }

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();

    while (node) {
      callback(node);
      node = walker.nextNode();
    }
  }

  function convertAttributes(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    var elements = [root].concat(Array.prototype.slice.call(root.querySelectorAll("[title], [aria-label]")));

    elements.forEach(function (element) {
      ["title", "aria-label"].forEach(function (attribute) {
        var value = element.getAttribute(attribute);

        if (value) {
          var originals = convertedAttributes.get(element) || {};
          var original = originals[attribute] || value;
          var converted = window.ZenHanCorrector.convertText(original);

          if (converted !== value) {
            element.setAttribute(attribute, converted);
          }

          if (converted !== original) {
            originals[attribute] = original;
            convertedAttributes.set(element, originals);
          }
        }
      });
    });
  }

  function convertPage(root) {
    walkTextNodes(root || document.body, convertTextNode);
    convertAttributes(root || document.body);
  }

  function restorePage() {
    walkTextNodes(document.body, restoreTextNode);

    document.querySelectorAll("[title], [aria-label]").forEach(function (element) {
      var originals = convertedAttributes.get(element);

      if (!originals) {
        return;
      }

      Object.keys(originals).forEach(function (attribute) {
        element.setAttribute(attribute, originals[attribute]);
      });

      convertedAttributes.delete(element);
    });
  }

  function startObserver() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          convertPage(node);
        });

        if (mutation.type === "characterData") {
          if (changedByExtension.has(mutation.target)) {
            changedByExtension.delete(mutation.target);
            return;
          }

          convertedNodes.delete(mutation.target);
          convertTextNode(mutation.target);
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (!observer) {
      return;
    }

    observer.disconnect();
    observer = null;
  }

  function setEnabled(enabled) {
    if (enabled) {
      convertPage(document.body);
      startObserver();
    } else {
      stopObserver();
      restorePage();
    }
  }

  chrome.storage.sync.get({ enabled: true }, function (items) {
    setEnabled(items[STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "sync" && changes[STORAGE_KEY]) {
      setEnabled(changes[STORAGE_KEY].newValue);
    }
  });

  chrome.runtime.onMessage.addListener(function (message) {
    if (message && message.type === "ZENHAN_RECONVERT") {
      convertPage(document.body);
    }
  });
}());

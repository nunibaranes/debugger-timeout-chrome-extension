function setDebugger() {
  chrome.storage.sync.get("options", function ({ options }) {
    if (options.time) {
      setTimeout(() => {
        debugger;
      }, options.time);
    }
  });
}

setDebugger();

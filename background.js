// on first install open onboarding
chrome.runtime.onInstalled.addListener((response) => {
  if (response.reason === "install") {
    chrome.tabs.create({
      url: "popup.html",
    });
  }
});

//get current tab and execute script
async function executeScript() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);

  chrome.scripting.executeScript({
    files: ["debuggerTimeout.js"],
    target: { tabId: tab.id },
  });
}

//update on page reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    console.log("update");
    executeScript();
  }
});

//TODO: refresh tab if DOM was modiefied and extension is no longer running
chrome.tabs.onActivated.addListener(() => {
  // chrome.storage.sync.get("options", function ({ options }) {
  // if (!options) return;

  console.log("activate");
  executeScript();
  // });
});

//update on storage change
// chrome.storage.onChanged.addListener((changed) => {
//   console.log("storage:", changed);
//   executeScript();
// });

//refresh current tab when reset clicked
chrome.runtime.onMessage.addListener(({ message }) => {
  if (message === "reset") {
    chrome.tabs.reload();
  } else if (message === "runDebugger") {
    executeScript();
  }
});

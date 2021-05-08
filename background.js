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
  const tabs = await chrome.tabs.query(queryOptions);

  if (tabs.length) {
    chrome.scripting.executeScript({
      files: ["debuggerTimeout.js"],
      target: { tabId: tabs[0].id },
    });
  } else {
    throw new Error("Can't find tab's id");
  }
}

//refresh current tab when reset clicked
chrome.runtime.onMessage.addListener(({ message }) => {
  if (message === "reset") {
    // chrome.tabs.reload();
  } else if (message === "runDebugger") {
    executeScript();
  }
});

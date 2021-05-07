const HIDDEN = "hidden";
const timeFormField = document.querySelector("#time-form-field");
const inputTime = document.querySelector("#time-field");
const timeControls = document.querySelectorAll(".time-controls");
const previewTime = document.querySelector("#time-preview");
const secondsTimer = document.querySelector("#seconds-timer");
const secondsTextTime = document.querySelector("#seconds");
const reloadSecondsTextTime = document.querySelector("#reload");
const submitBtn = document.querySelector("#submit");
const resetBtn = document.querySelector("#reset");

//get storage and update popup state
chrome.storage.sync.get("options", function ({ options }) {
  updateElements(options, true);
});

//prevent form submission
document
  .querySelector(".form")
  .addEventListener("submit", (e) => e.preventDefault());

function timeValidation(value) {
  if (!value) {
    inputTime.value = 1;
  }

  return Boolean(value);
}

function convertToMilliseconds(value) {
  return parseInt(value) * 1000;
}

function convertToSeconds(value) {
  return parseInt(value) / 1000;
}

function startCountdown(seconds) {
  let counter = seconds;

  const interval = setInterval(() => {
    counter--;
    secondsTextTime.innerText = counter;

    if (counter < 0) {
      clearInterval(interval);
      secondsTextTime.innerText = seconds;
      secondsTimer.classList.add("reload");
      reloadSecondsTextTime.classList.remove(HIDDEN);
      enableResetButton();
    }
  }, 1000);
}

function reloadTimePreview() {
  secondsTimer.classList.remove("reload");
  reloadSecondsTextTime.classList.add(HIDDEN);
}

function runDebugger() {
  const time = convertToMilliseconds(inputTime.value);

  const options = { time };

  chrome.storage.sync.set({ options });
  chrome.runtime.sendMessage({ message: "runDebugger" });

  reloadTimePreview();
  updateElements(options);
  startCountdown(parseInt(inputTime.value));
}

function enableResetButton() {
  resetBtn.classList.remove("disabled");
}

function updateElements(options, shouldEnableResetButton) {
  if (options) {
    resetBtn.classList.remove(HIDDEN);
    submitBtn.classList.add(HIDDEN);
    timeFormField.classList.add(HIDDEN);
    previewTime.classList.remove(HIDDEN);
    updateSecondsTextTime(convertToSeconds(options.time));
    inputTime.innerHTML = convertToSeconds(options.time);

    if (shouldEnableResetButton) {
      enableResetButton();
    }
  }
}

function updateSecondsTextTime(time) {
  secondsTextTime.innerText = time;
}

reloadSecondsTextTime.addEventListener("click", runDebugger);

timeControls.forEach((control) => {
  control.addEventListener("click", () => {
    if (control.classList.contains("step-up")) {
      inputTime.stepUp();
    } else if (control.classList.contains("step-down")) {
      inputTime.stepDown();
    }
  });
});

submitBtn.addEventListener("click", runDebugger);

resetBtn.addEventListener("click", () => {
  chrome.storage.sync.clear(() => {
    chrome.runtime.sendMessage({ message: "reset" });
  });
  document.location.reload();
});

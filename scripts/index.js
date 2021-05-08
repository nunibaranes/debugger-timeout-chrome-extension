const HIDDEN = "hidden";
const DISABLED = "disabled";

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
  updateElements({
    ...options,
    submitBtnEnabled: true,
    resetBtnEnabled: Boolean(options?.time),
    showReset: Boolean(options?.time),
  });
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
      resetBtn.classList.remove(HIDDEN);
      toggleEnableButton(resetBtn, true);
      toggleEnableButton(submitBtn, true);
    }
  }, 1000);
}

function reloadTimePreview() {
  secondsTimer.classList.remove("reload");
  reloadSecondsTextTime.classList.add(HIDDEN);
}

function runDebugger() {
  const time = convertToMilliseconds(inputTime.value);

  const options = {
    time,
    submitBtnEnabled: false,
    resetBtnEnabled: false,
    showReset: false,
  };

  chrome.storage.sync.set({ options });
  chrome.runtime.sendMessage({ message: "runDebugger" });

  reloadTimePreview();
  updateElements(options);
  startCountdown(parseInt(inputTime.value));
}

function toggleEnableButton(button, isEnable) {
  if (isEnable) {
    button.classList.remove(DISABLED);
  } else {
    button.classList.add(DISABLED);
  }
}

function updateElements({
  time,
  resetBtnEnabled,
  submitBtnEnabled,
  showReset,
}) {
  // chrome
  chrome.action.setBadgeBackgroundColor({ color: "#023047" });
  chrome.action.setBadgeText(
    time ? { text: `${convertToSeconds(time)}s` } : { text: "" },
  );

  // popup's
  if (time) {
    showReset && resetBtn.classList.remove(HIDDEN);
    timeFormField.classList.add(HIDDEN);
    previewTime.classList.remove(HIDDEN);
    updateSecondsTextTime(convertToSeconds(time));
    inputTime.innerHTML = convertToSeconds(time);
    inputTime.value = convertToSeconds(time);
  }
  toggleEnableButton(resetBtn, resetBtnEnabled);
  toggleEnableButton(submitBtn, submitBtnEnabled);
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

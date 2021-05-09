const HIDDEN = "hidden";
const DISABLED = "disabled";
const RERUN = "rerun";
const DONE = "done";

const rootStyles = document.documentElement.style;
const timeFormField = document.querySelector("#time-form-field");
const inputTime = document.querySelector("#time-field");
const timeControls = document.querySelectorAll(".time-controls");
const previewTime = document.querySelector("#time-preview");
const secondsTimer = document.querySelector("#seconds-timer");
const secondsTextTime = document.querySelector("#seconds");
const reloadSecondsTextTime = document.querySelector("#rerun");
const submitBtn = document.querySelector("#submit");
const resetBtn = document.querySelector("#reset");
const progressCircle = document.querySelector(".ko-progress-circle");

/**
 * Event listeners
 */

//get storage and update popup state
chrome.storage.sync.get("options", function ({ options }) {
  setGlobals({
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

function updateSecondsTextTime(time) {
  secondsTextTime.innerText = time;
}

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

reloadSecondsTextTime.addEventListener("click", runDebugger);

resetBtn.addEventListener("click", () => {
  chrome.storage.sync.clear(() => {
    chrome.runtime.sendMessage({ message: "reset" });
  });
  document.location.reload();
});

/**
 * utils
 */

/**
 * convertToMilliseconds
 * @param {string} value
 */
function convertToMilliseconds(value) {
  return parseInt(value) * 1000;
}

/**
 * convertToSeconds
 * @param {string} value
 */
function convertToSeconds(value) {
  return parseInt(value) / 1000;
}

/**
 * setGlobalsAfterCountdown
 * @param {number} initialTime
 */
function setGlobalsAfterCountdown(initialTime) {
  secondsTextTime.innerText = initialTime;
  secondsTimer.classList.add(RERUN);
  reloadSecondsTextTime.classList.remove(HIDDEN);
  resetBtn.classList.remove(HIDDEN);
  toggleEnableButton(resetBtn, true);
  toggleEnableButton(submitBtn, true);
  setProgressCircle(false);
}

/**
 * startCountdown
 * @param {number} initialTime
 */
function startCountdown(initialTime) {
  let counter = initialTime;

  const interval = setInterval(() => {
    counter--;
    secondsTextTime.innerText = counter;

    if (counter < 0) {
      clearInterval(interval);
      setGlobalsAfterCountdown(initialTime);
    }
  }, 1000);
}

/**
 * hideRerun - hides the rerun element
 */
function hideRerun() {
  secondsTimer.classList.remove(RERUN);
  reloadSecondsTextTime.classList.add(HIDDEN);
}

/**
 * setProgressCircle
 * @param {boolean} isActive
 */
function setProgressCircle(isActive) {
  progressCircle.setAttribute("data-progress", isActive ? 100 : 0);

  // prevents animation when `data-progress` sets to 0.
  if (!isActive) {
    progressCircle.classList.add(DONE);
    setTimeout(() => progressCircle.classList.remove(DONE), 0);
  }
}

/**
 * runDebugger
 * sets options,
 * calls to chrome's API,
 * calls to `hideRerun` & `setGlobals` & `setProgressCircle` & `startCountdown`
 *
 */
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

  hideRerun();
  setGlobals(options);
  setProgressCircle(true);
  startCountdown(parseInt(inputTime.value));
}

/**
 * toggleEnableButton
 * @param {HTMLButtonElement} button
 * @param {boolean} isEnable
 */
function toggleEnableButton(button, isEnable) {
  isEnable ? button.classList.remove(DISABLED) : button.classList.add(DISABLED);
}

/**
 *
 * @param {{
 *  time?: number,
 *  resetBtnEnabled: boolean,
 *  submitBtnEnabled: boolean,
 *  showReset: boolean
 * }} object
 */
function setGlobals({ time, resetBtnEnabled, submitBtnEnabled, showReset }) {
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

  // css variables
  rootStyles.setProperty(
    "--progress-bar-transition-length",
    time ? `${convertToSeconds(time)}s` : "1s",
  );
}

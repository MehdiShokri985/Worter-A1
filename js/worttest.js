// خواندن داده‌ها از localStorage
const data = JSON.parse(localStorage.getItem("testGroupData")) || [];

let score = 0;
let selectedGerman = null;
let selectedPersian = null;
let matchedPairs = 0;
let lockSelection = false;
let timeLeft = 840; // 300 seconds timer
let timerInterval = null;

const germanColumn = document.getElementById("german-column");
const persianColumn = document.getElementById("persian-column");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const popup = document.getElementById("result-popup");
const totalScoreDisplay = document.getElementById("total-score");
const earnedScoreDisplay = document.getElementById("earned-score");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadPageItems() {
  // دریافت groupIndex از URL
  const urlParams = new URLSearchParams(window.location.search);
  const groupIndex = parseInt(urlParams.get("groupIndex")) || 0; // مقدار پیش‌فرض 0 در صورت عدم وجود
  document.getElementById("group-index").textContent = groupIndex; // نمایش groupIndex

  germanColumn.innerHTML = "";
  persianColumn.innerHTML = "";

  // مرتب‌سازی داده‌های آلمانی بر اساس Sound_de
  const sortedGerman = [...data].sort((a, b) =>
    a.Sound_de.localeCompare(b.Sound_de)
  );
  // داده‌های پارسی همچنان به‌صورت تصادفی
  const shuffledPersian = shuffle([...data]);

  sortedGerman.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item german";
    div.textContent = item.Sound_de;
    div.dataset.filename = item.Filename;
    div.addEventListener("click", () => selectItem(div, "german"));
    germanColumn.appendChild(div);
  });

  shuffledPersian.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item persian";
    div.textContent = item.translate_fa;
    div.dataset.filename = item.Filename;
    div.addEventListener("click", () => selectItem(div, "persian"));
    persianColumn.appendChild(div);
  });
}

function selectItem(element, type) {
  if (lockSelection || element.classList.contains("correct")) return;

  element.classList.add("selected");
  if (type === "german") {
    if (selectedGerman) selectedGerman.classList.remove("selected");
    selectedGerman = element;
  } else {
    if (selectedPersian) selectedPersian.classList.remove("selected");
    selectedPersian = element;
  }

  if (selectedGerman && selectedPersian) {
    checkMatch();
  }
}

function checkMatch() {
  lockSelection = true;
  if (selectedGerman.dataset.filename === selectedPersian.dataset.filename) {
    selectedGerman.classList.add("correct");
    selectedPersian.classList.add("correct");
    score++;
    matchedPairs++;
    scoreDisplay.textContent = score;
    const audio = new Audio(`audio/${selectedGerman.dataset.filename}_de.mp3`);
    audio.play();
    selectedGerman = null;
    selectedPersian = null;
    lockSelection = false;
    if (matchedPairs === data.length) {
      clearInterval(timerInterval); // Stop timer when all pairs are matched
      showResult();
    }
  } else {
    selectedGerman.classList.add("wrong");
    selectedPersian.classList.add("wrong");
    score--;
    scoreDisplay.textContent = score;
    const audio = new Audio("audio/falsch.mp3");
    audio.play();
    setTimeout(() => {
      if (selectedGerman) selectedGerman.classList.remove("wrong");
      if (selectedPersian) selectedPersian.classList.remove("wrong");
      if (selectedGerman) selectedGerman.classList.remove("selected");
      if (selectedPersian) selectedPersian.classList.remove("selected");
      selectedGerman = null;
      selectedPersian = null;
      lockSelection = false;
    }, 1000);
  }
}

function showResult() {
  totalScoreDisplay.textContent = data.length;
  earnedScoreDisplay.textContent = score;
  popup.style.display = "block";
  clearInterval(timerInterval); // Ensure timer stops when showing result
}

function restartGame() {
  score = 0;
  matchedPairs = 0;
  timeLeft = 840; // Reset timer
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  popup.style.display = "none";
  loadPageItems();
  startTimer(); // Restart timer
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResult(); // Show result when time is up
    }
  }, 1000);
}

// Start the timer when the page loads
startTimer();
loadPageItems();

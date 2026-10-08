const multiplierInput = document.getElementById("multiplierInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");

const totalRounds = document.getElementById("totalRounds");
const average = document.getElementById("average");
const median = document.getElementById("median");
const highest = document.getElementById("highest");
const lowest = document.getElementById("lowest");
const belowTwo = document.getElementById("belowTwo");

const volatilityBox = document.getElementById("volatilityBox");
const volatilityTitle = document.getElementById("volatilityTitle");
const volatilityText = document.getElementById("volatilityText");

const lowStreak = document.getElementById("lowStreak");
const highStreak = document.getElementById("highStreak");
const longestLow = document.getElementById("longestLow");
const longestHigh = document.getElementById("longestHigh");

const results = document.getElementById("results");
const chart = document.getElementById("chart");

let rounds = JSON.parse(localStorage.getItem("aviatorRounds")) || [];


/* =========================
   SAVE DATA
========================= */

function saveRounds() {
  localStorage.setItem("aviatorRounds", JSON.stringify(rounds));
}


/* =========================
   ADD ROUND
========================= */

function addRound() {

  const value = parseFloat(multiplierInput.value);

  if (isNaN(value) || value < 1) {
    alert("Please enter a valid multiplier of 1.00 or higher.");
    return;
  }

  rounds.push(Number(value.toFixed(2)));

  saveRounds();

  multiplierInput.value = "";

  updateApp();

  multiplierInput.focus();
}


/* =========================
   CLEAR DATA
========================= */

function clearRounds() {

  if (rounds.length === 0) {
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete all recorded rounds?"
  );

  if (!confirmed) {
    return;
  }

  rounds = [];

  saveRounds();

  updateApp();
}


/* =========================
   AVERAGE
========================= */

function calculateAverage(data) {

  if (data.length === 0) {
    return 0;
  }

  const total = data.reduce((sum, value) => sum + value, 0);

  return total / data.length;
}


/* =========================
   MEDIAN
========================= */

function calculateMedian(data) {

  if (data.length === 0) {
    return 0;
  }

  const sorted = [...data].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}


/* =========================
   PERCENTAGE BELOW 2X
========================= */

function calculateBelowTwo(data) {

  if (data.length === 0) {
    return 0;
  }

  const lowRounds = data.filter(value => value < 2).length;

  return (lowRounds / data.length) * 100;
}


/* =========================
   STREAK CALCULATION
========================= */

function calculateStreaks(data) {

  let currentLow = 0;
  let currentHigh = 0;

  let longestLowValue = 0;
  let longestHighValue = 0;

  let lowCount = 0;
  let highCount = 0;

  for (let i = 0; i < data.length; i++) {

    if (data[i] < 2) {

      lowCount++;
      highCount = 0;

      if (lowCount > longestLowValue) {
        longestLowValue = lowCount;
      }

    } else {

      highCount++;
      lowCount = 0;

      if (highCount > longestHighValue) {
        longestHighValue = highCount;
      }
    }
  }

  for (let i = data.length - 1; i >= 0; i--) {

    if (data[i] < 2) {
      currentLow++;
    } else {
      break;
    }
  }

  for (let i = data.length - 1; i >= 0; i--) {

    if (data[i] >= 2) {
      currentHigh++;
    } else {
      break;
    }
  }

  return {
    currentLow,
    currentHigh,
    longestLow: longestLowValue,
    longestHigh: longestHighValue
  };
}


/* =========================
   VOLATILITY
========================= */

function calculateVolatility(data) {

  if (data.length < 5) {

    return {
      title: "Not enough data",
      text: "Enter at least 5 rounds for a basic volatility assessment.",
      className: "neutral"
    };

  }

  const recent = data.slice(-20);

  const avg = calculateAverage(recent);

  const variance =
    recent.reduce((sum, value) => {
      return sum + Math.pow(value - avg, 2);
    }, 0) / recent.length;

  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation < 1) {

    return {
      title: "Lower volatility",
      text: "The recent results are relatively close together. This does NOT mean the next round is predictable.",
      className: "low-risk"
    };

  }

  if (standardDeviation < 3) {

    return {
      title: "Medium volatility",
      text: "The recent results show a moderate spread. Past results still cannot reliably predict the next round.",
      className: "medium-risk"
    };

  }

  return {
    title: "High volatility",
    text: "The recent results vary considerably. This is a warning that recent history is especially unreliable for prediction.",
    className: "high-risk"
  };
}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStatistics() {

  const count = rounds.length;

  totalRounds.textContent = count;

  if (count === 0) {

    average.textContent = "0.00x";
    median.textContent = "0.00x";
    highest.textContent = "0.00x";
    lowest.textContent = "0.00x";
    belowTwo.textContent = "0%";

    return;
  }

  const avg = calculateAverage(rounds);
  const med = calculateMedian(rounds);
  const high = Math.max(...rounds);
  const low = Math.min(...rounds);
  const below = calculateBelowTwo(rounds);

  average.textContent = avg.toFixed(2) + "x";
  median.textContent = med.toFixed(2) + "x";
  highest.textContent = high.toFixed(2) + "x";
  lowest.textContent = low.toFixed(2) + "x";
  belowTwo.textContent = below.toFixed(1) + "%";
}


/* =========================
   UPDATE STREAKS
========================= */

function updateStreaks() {

  const streaks = calculateStreaks(rounds);

  lowStreak.textContent = streaks.currentLow;
  highStreak.textContent = streaks.currentHigh;
  longestLow.textContent = streaks.longestLow;
  longestHigh.textContent = streaks.longestHigh;
}


/* =========================
   UPDATE VOLATILITY
========================= */

function updateVolatility() {

  const result = calculateVolatility(rounds);

  volatilityBox.className =
    "volatility " + result.className;

  volatilityTitle.textContent = result.title;
  volatilityText.textContent = result.text;
}


/* =========================
   DISPLAY RESULTS
========================= */

function displayResults() {

  if (rounds.length === 0) {

    results.innerHTML =
      '<p class="empty">No rounds entered yet.</p>';

    return;
  }

  results.innerHTML = "";

  const recent = rounds.slice(-50).reverse();

  recent.forEach((value, index) => {

    const actualIndex =
      rounds.length - index;

    const item = document.createElement("div");

    item.className = "result";

    const number = document.createElement("span");

    number.className = "result-number";

    number.textContent =
      "#" + actualIndex;

    const multiplier = document.createElement("span");

    multiplier.className =
      "multiplier " +
      (value < 2 ? "low" : "high");

    multiplier.textContent =
      value.toFixed(2) + "x";

    item.appendChild(number);
    item.appendChild(multiplier);

    results.appendChild(item);
  });
}


/* =========================
   DRAW CHART
========================= */

function drawChart() {

  if (rounds.length === 0) {

    chart.innerHTML =
      '<p class="empty">Add rounds to see the chart.</p>';

    return;
  }

  chart.innerHTML = "";

  const recent = rounds.slice(-40);

  const maxValue = Math.max(...recent, 2);

  recent.forEach((value, index) => {

    const container =
      document.createElement("div");

    container.className =
      "bar-container";

    const bar =
      document.createElement("div");

    bar.className =
      "bar " +
      (value >= 2 ? "high-bar" : "");

    const height =
      Math.max((value / maxValue) * 175, 5);

    bar.style.height =
      height + "px";

    const label =
      document.createElement("span");

    label.className =
      "bar-label";

    label.textContent =
      value.toFixed(1);

    bar.appendChild(label);

    container.appendChild(bar);

    chart.appendChild(container);
  });
}


/* =========================
   UPDATE EVERYTHING
========================= */

function updateApp() {

  updateStatistics();

  updateStreaks();

  updateVolatility();

  displayResults();

  drawChart();
}


/* =========================
   BUTTON EVENTS
========================= */

addButton.addEventListener(
  "click",
  addRound
);

clearButton.addEventListener(
  "click",
  clearRounds
);


/* =========================
   ENTER KEY
========================= */

multiplierInput.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Enter") {
      addRound();
    }

  }
);


/* =========================
   START APP
========================= */

updateApp();
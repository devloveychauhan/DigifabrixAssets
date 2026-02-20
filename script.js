let barChart = null;
let lineChart = null;


function cssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function responsiveFont(base) {
    let w = window.innerWidth;
    if (w > 1800) return base + 2;
    if (w > 1200) return base;
    if (w > 768) return base - 1;
    return base - 2;
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function generateDayLabels(year, month) {
    let days = getDaysInMonth(year, month);
    let labels = [];
    for (let i = 1; i <= days; i++) {
        labels.push(i.toString());
    }
    return labels;
}



let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth() + 1;

let dailyLabels = generateDayLabels(currentYear, currentMonth);


let dailyProductionValues = [];
for (let i = 0; i < dailyLabels.length; i++) {
    dailyProductionValues.push(Math.floor(Math.random() * 1500));
}

/* Dummy Rework % Data (0–20%) */
let dailyReworkValues = [];
for (let j = 0; j < dailyLabels.length; j++) {
    dailyReworkValues.push(Math.floor(Math.random() * 15));
}

function getReworkColor(values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += values[i];
    }
    var avg = sum / values.length;

    return avg < 5 ? "#e63946" : "#16a34a";
}


function getCommonOptions(yTitle, minVal, maxVal, stepSize, isBar) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,

        plugins: {
            legend: {
                labels: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) }
                }
            },
            datalabels: {
                color: cssVar("--text"),
                anchor: "end",
                align: "top",
                offset: 4,
                clamp: true,
                rotation: isBar ? -90 : 0,

                font: {
                    size: responsiveFont(16),
                    weight: "bold"
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) },
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                min: minVal,
                max: maxVal,
                ticks: {
                    stepSize: stepSize,
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) }
                },
                title: {
                    display: true,
                    text: yTitle,
                    color: cssVar("--text"),
                    font: { size: responsiveFont(16) }
                }
            }
        }
    };
}


function buildDailyProductionChart() {
    return new Chart(
        document.getElementById("barChart"),
        {
            type: "bar",
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: "Daily Battery Production",
                    data: dailyProductionValues,
                    backgroundColor: "#3b82f6",
                    borderRadius: 3,
                }]
            },
            options: getCommonOptions(
                "Units",
                0,
                1800,   // fixed max
                200,
                true     // interval,

            )
        }
    );
}


function buildDailyReworkChart() {
    return new Chart(
        document.getElementById("lineChart"),
        {
            type: "line",
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: "Daily Rework %",
                    data: dailyReworkValues,
                    borderColor: "#e63946",
                    backgroundColor: "rgba(230,57,70,0.3)",
                    pointBackgroundColor: "#e63946",
                    pointRadius: 3,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: getCommonOptions(
                "Rework %",
                0,
                24,
                2, false
            )
        }
    );
}


function initCharts() {

    let barCanvas = document.getElementById("barChart");
    let lineCanvas = document.getElementById("lineChart");

    if (!barCanvas || !lineCanvas) return;

    barChart = buildDailyProductionChart();
    lineChart = buildDailyReworkChart();
}

/* ==========================================================
   THEME HANDLING
========================================================== */

function updateThemeCharts() {
    if (!barChart || !lineChart) return;

    barChart.options = getCommonOptions("Units ", 0, 1600, 200, true);
    lineChart.options = getCommonOptions("Rework %", 0, 20, 2, false);

    barChart.update();
    lineChart.update();
}

function setupTheme() {
    let toggleBtn = document.getElementById("themeToggle");
    let saved = localStorage.getItem("dashboard-theme");

    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleBtn.innerText = "☀️ Light Mode";
    }

    toggleBtn.addEventListener("click", function () {
        let isDark =
            document.documentElement.getAttribute("data-theme") === "dark";

        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "" : "dark"
        );

        toggleBtn.innerText =
            isDark ? "🌙 Dark Mode" : "☀️ Light Mode";

        localStorage.setItem(
            "dashboard-theme",
            isDark ? "light" : "dark"
        );

        updateThemeCharts();
    });
}

/* ==========================================================
   REGISTER DATALABELS
========================================================== */

if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
}

/* ==========================================================
   START
========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initCharts();
    setupTheme();
});

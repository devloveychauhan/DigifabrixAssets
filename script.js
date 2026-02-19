/* ==========================================================
   STATE
========================================================== */

var barChart = null;
var lineChart = null;

/* ==========================================================
   UTILITIES
========================================================== */

function cssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function responsiveFont(base) {
    var w = window.innerWidth;
    if (w > 1800) return base + 2;
    if (w > 1200) return base;
    if (w > 768) return base - 1;
    return base - 2;
}

/* ==========================================================
   CHART DATA (Dummy – Replace with API later)
========================================================== */

var barData = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    values: [108, 371, 315, 47, 336, 67, 372, 146, 254, 223, 90, 100]
};

var lineData = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    values: [98, 320, 290, 60, 300, 80, 350, 130, 220, 200, 100, 120]
};

/* ==========================================================
   COMMON OPTIONS
========================================================== */

function getCommonOptions(yTitle, dataValues) {

    var maxValue = Math.max.apply(null, dataValues);

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
                offset: 6,
                clamp: true,
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
                beginAtZero: true,
                suggestedMax: maxValue * 1.1, 
                ticks: {
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

function buildBarChart() {

    return new Chart(
        document.getElementById("barChart"),
        {
            type: "bar",
            data: {
                labels: barData.labels,
                datasets: [{
                    label: "Monthly Production Trend",
                    data: barData.values,
                    backgroundColor: "#3b82f6",
                    borderRadius: 4
                }]
            },
            options: getCommonOptions("Hundreds", barData.values)
        }
    );
}


function buildLineChart() {

    return new Chart(
        document.getElementById("lineChart"),
        {
            type: "line",
            data: {
                labels: lineData.labels,
                datasets: [{
                    label: "Rework Percentage (%) Trend",
                    data: lineData.values,
                    borderColor: "#e63946",
                    backgroundColor: "rgba(230,57,70,0.15)",
                    pointBackgroundColor: "#e63946",
                    pointBorderColor: "#e63946",
                    pointRadius: 4,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: getCommonOptions("Rework %", lineData.values)
        }
    );
}

/* ==========================================================
   INIT CHARTS
========================================================== */

function initCharts() {

    var barCanvas = document.getElementById("barChart");
    var lineCanvas = document.getElementById("lineChart");

    if (!barCanvas || !lineCanvas) return;

    barChart = buildBarChart();
    lineChart = buildLineChart();
}

/* ==========================================================
   THEME HANDLING
========================================================== */

function updateChartTheme() {

    if (!barChart || !lineChart) return;

    // update only colors + scales
    barChart.options = getCommonOptions("Units Produced", barData.values);
    lineChart.options = getCommonOptions("Rework %", lineData.values);

    barChart.update();
    lineChart.update();
}

function setupTheme() {

    var toggleBtn = document.getElementById("themeToggle");
    if (!toggleBtn) return;

    var saved = localStorage.getItem("dashboard-theme");

    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleBtn.innerText = "☀️ Light Mode";
    }

    toggleBtn.addEventListener("click", function () {

        var isDark =
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

        updateChartTheme();
    });
}

/* ==========================================================
   REGISTER DATALABELS (Important for LG browser)
========================================================== */

if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initCharts();
    setupTheme();

});

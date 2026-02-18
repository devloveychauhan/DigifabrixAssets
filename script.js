

var barChart = null;
var lineChart = null;

/* ==========================================================
   PLAN FUNCTIONS
========================================================== */

function reloadPlans() {
    var planDateEl = document.getElementById("planDate");
    var shiftEl = document.getElementById("shiftId");

    var d = planDateEl ? planDateEl.value : null;
    var s = shiftEl ? shiftEl.value : null;

    if (!d || !s) return;

    window.location.href =
        "?date=" + encodeURIComponent(d) +
        "&shift_id=" + encodeURIComponent(s);
}

function setKpi(p) {
    var map = {
        kDate: p.PlanDate + " (" + p.ShiftName + ")",
        kTime: p.ServerTime,
        kLine: p.LineName,
        kModel: p.Model || "-",
        kSfg: p.SFG_Code,
        kTotalPlan: p.TotalPlan,
        kTotalActual: p.TotalActual,
        kTargetUph: p.Target_UPH,
        kActualUph: p.ActualUPH
    };

    Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.innerText = map[id];
    });
}

/* ==========================================================
   TABLE
========================================================== */

function buildRows(rows) {
    var body = document.getElementById("tableBody");
    if (!body) return;

    body.innerHTML = "";

    if (!rows || !rows.length) {
        body.innerHTML = "<tr><td colspan='6'>No data</td></tr>";
        return;
    }

    rows.forEach(function (r) {
        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + r.timing + "</td>" +
            "<td>" + r.uph_target + "</td>" +
            "<td>" + r["Cell Short"] + "</td>" +
            "<td>" + r["Laser Weld"] + "</td>" +
            "<td>" + r["BMS Mounting"] + "</td>" +
            "<td>" + r["FQC"] + "</td>";
        body.appendChild(tr);
    });
}

function loadPlan(planId) {
    fetch("?ajax=1&plan_id=" + planId, { cache: "no-store" })
        .then(function (res) { return res.json(); })
        .then(function (js) {
            if (!js.ok) return;
            setKpi(js.data.plan);
            buildRows(js.data.rows);
        })
        .catch(function (err) {
            console.error("Load plan error:", err);
        });
}

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
   CHART DATA (Dummy)
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
   COMMON CHART OPTIONS
========================================================== */

function getCommonChartOptions(yTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                labels: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(12) }
                }
            },
            datalabels: {
                color: cssVar("--text"),
                font: { size: responsiveFont(14) },
                anchor: "end",
                align: "top",
                offset: 2,
                clamp: true
            }
        },

        scales: {
            x: {
                ticks: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(14) },
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: cssVar("--text"),
                    font: { size: responsiveFont(14) }
                },
                title: {
                    display: true,
                    text: yTitle,
                    color: cssVar("--text"),
                    font: { size: responsiveFont(14) }
                }
            }
        }
    };
}

/* ==========================================================
   BUILD CHART CONFIGS
========================================================== */

function buildBarChartConfig(data) {
    return {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Monthly Production Trend",
                data: data.values,
                backgroundColor: "#3b82f6",
                borderRadius: 4
            }]
        },
        options: getCommonChartOptions("Hundreds")

    };
}

function buildLineChartConfig(data) {
    return {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Rework Percentage(%) Trend",
                data: data.values,
                borderColor: "#e63946",
                backgroundColor: "rgba(230,57,70,0.15)",
                pointBackgroundColor: "#e63946",
                pointBorderColor: "#e63946",
                pointRadius: 4,
                borderWidth: 2,
                tension: 0.35,
                fill: true,
            }]
        },

        options: getCommonChartOptions("Rework %")
    };
}

/* ==========================================================
   INIT CHARTS
========================================================== */

function initCharts() {
    var barCtx = document.getElementById("barChart");
    var lineCtx = document.getElementById("lineChart");

    if (!barCtx || !lineCtx) return;

    barChart = new Chart(barCtx, buildBarChartConfig(barData));
    lineChart = new Chart(lineCtx, buildLineChartConfig(lineData));
}

/* ==========================================================
   THEME HANDLING
========================================================== */

function refreshCharts() {
    if (!barChart || !lineChart) return;

    barChart.options = getCommonChartOptions("Hundred");
    lineChart.options = getCommonChartOptions("Efficiency %");

    barChart.update();
    lineChart.update();
}

function setupTheme() {
    var toggleBtn = document.getElementById("themeToggle");
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

        refreshCharts();
    });
}

/* ==========================================================
   REGISTER PLUGIN (IMPORTANT FOR LG)
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
